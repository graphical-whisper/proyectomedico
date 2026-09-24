import { pool, getDbConnectionStatus } from '../config/database.js';
import { InpatientConsultation } from '../types/index.js';

export class ConsultationRepository {
  private inMemoryConsultations: InpatientConsultation[] = [];

  async create(consultation: InpatientConsultation): Promise<InpatientConsultation> {
    const id = consultation.id || `cons-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const fullConsultation: InpatientConsultation = {
      ...consultation,
      id,
      createdAt: now,
      updatedAt: now
    };

    if (getDbConnectionStatus()) {
      try {
        const query = `
          INSERT INTO inpatient_consultations (
            id, patient_name, patient_id_number, consult_date, consult_time,
            visit_type, requesting_physician, data, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id, created_at, updated_at;
        `;
        const values = [
          id,
          consultation.patientName,
          consultation.patientIdNumber || null,
          consultation.date,
          consultation.time,
          consultation.visitType,
          consultation.requestingPhysician || null,
          JSON.stringify(fullConsultation),
          now,
          now
        ];

        const res = await pool.query(query, values);
        if (res.rows.length > 0) {
          fullConsultation.id = res.rows[0].id;
          fullConsultation.createdAt = res.rows[0].created_at;
          fullConsultation.updatedAt = res.rows[0].updated_at;
        }
      } catch (err: any) {
        console.warn('Error al persistir consulta en PostgreSQL, guardando en memoria:', err.message);
      }
    }

    this.inMemoryConsultations.unshift(fullConsultation);
    return fullConsultation;
  }

  async findById(id: string): Promise<InpatientConsultation | null> {
    if (getDbConnectionStatus()) {
      try {
        const res = await pool.query('SELECT data FROM inpatient_consultations WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          return res.rows[0].data as InpatientConsultation;
        }
      } catch (err: any) {
        console.warn('Error al buscar consulta en PostgreSQL:', err.message);
      }
    }

    return this.inMemoryConsultations.find(c => c.id === id) || null;
  }

  async findAll(limit: number = 20): Promise<InpatientConsultation[]> {
    if (getDbConnectionStatus()) {
      try {
        const res = await pool.query(
          'SELECT data FROM inpatient_consultations ORDER BY created_at DESC LIMIT $1',
          [limit]
        );
        return res.rows.map(r => r.data as InpatientConsultation);
      } catch (err: any) {
        console.warn('Error al listar consultas desde PostgreSQL:', err.message);
      }
    }

    return this.inMemoryConsultations.slice(0, limit);
  }
}
