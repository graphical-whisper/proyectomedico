import { ConsultationRepository } from '../repositories/consultationRepository.js';
import { InpatientConsultation } from '../types/index.js';

export class ConsultationService {
  private consultRepo: ConsultationRepository;

  constructor(consultRepo?: ConsultationRepository) {
    this.consultRepo = consultRepo || new ConsultationRepository();
  }

  async createConsultation(data: Partial<InpatientConsultation>): Promise<InpatientConsultation> {
    if (!data.patientName || data.patientName.trim().length === 0) {
      throw new Error('El nombre del paciente es obligatorio.');
    }
    if (!data.date) {
      throw new Error('La fecha de la consulta es obligatoria.');
    }
    if (!data.time) {
      throw new Error('La hora de la consulta es obligatoria.');
    }
    if (!data.visitType) {
      throw new Error('Debe especificar si corresponde a Visita Inicial o Interconsulta.');
    }

    const consultationToSave = data as InpatientConsultation;
    return await this.consultRepo.create(consultationToSave);
  }

  async getConsultationById(id: string): Promise<InpatientConsultation | null> {
    return await this.consultRepo.findById(id);
  }

  async getRecentConsultations(limit: number = 20): Promise<InpatientConsultation[]> {
    return await this.consultRepo.findAll(limit);
  }

  generateClinicalSummaryText(c: InpatientConsultation): string {
    const lines: string[] = [];
    const tipo = c.visitType === 'consult' ? `INTERCONSULTA (Solicitante: ${c.requestingPhysician || 'No especificado'})` : 'VISITA HOSPITALARIA INICIAL';
    lines.push(`========================================================================`);
    lines.push(`HOSPITAL CLINICO - NOTA DE ${tipo}`);
    lines.push(`========================================================================`);
    lines.push(`Paciente: ${c.patientName} | Documento/Historia: ${c.patientIdNumber || 'N/A'}`);
    lines.push(`Fecha: ${c.date} | Hora: ${c.time}`);
    lines.push(``);
    lines.push(`--- ALERGIAS Y MEDICACION ---`);
    lines.push(`Alergias: ${c.nkda ? 'Sin alergias medicamentosas conocidas (NKDA)' : (c.allergiesList?.join(', ') || 'Sin especificar')}`);
    lines.push(`Medicacion activa: ${c.medicationsList?.length ? c.medicationsList.join('; ') : 'Ninguna registrada'}`);
    lines.push(`Venta libre (OTC): ${c.otcMeds ? 'Si' : 'No'} | Suplementos: ${c.supplements ? 'Si' : 'No'}`);
    lines.push(`Conciliacion domiciliaria considerada: ${c.homeMedsConsidered ? 'Si' : 'No'}`);
    lines.push(``);
    lines.push(`--- ENFERMEDAD ACTUAL (HPI) ---`);
    lines.push(`Motivo de consulta: ${c.chiefComplaint || 'No especificado'}`);
    if (c.hpiUnableToObtain) {
      lines.push(`* No fue posible obtener historia clínica completa: ${c.hpiUnableReason || 'Causa no especificada'}`);
    } else {
      if (c.hpiLocation) lines.push(`- Localizacion: ${c.hpiLocation}`);
      if (c.hpiQuality) lines.push(`- Calidad / Caracter: ${c.hpiQuality}`);
      if (c.hpiDuration) lines.push(`- Duracion: ${c.hpiDuration}`);
      if (c.hpiTiming) lines.push(`- Temporalidad: ${c.hpiTiming}`);
      if (c.hpiSeverity) lines.push(`- Severidad / Escala: ${c.hpiSeverity}`);
      if (c.hpiContext) lines.push(`- Contexto: ${c.hpiContext}`);
      if (c.hpiModifyingFactors) lines.push(`- Factores modificadores: ${c.hpiModifyingFactors}`);
      if (c.hpiAssociatedSymptoms) lines.push(`- Signos y sintomas asociados: ${c.hpiAssociatedSymptoms}`);
      if (c.hpiNarrative) lines.push(`- Relato cronologico: ${c.hpiNarrative}`);
    }
    lines.push(``);
    lines.push(`--- ANTECEDENTES ---`);
    lines.push(`Medicos / Quirurgicos: ${c.pastMedicalSurgical?.nonContributory ? 'No contributorio' : (c.pastMedicalSurgical?.conditions?.join(', ') || 'Sin patologias previas')}`);
    if (c.pastMedicalSurgical?.surgicalHistory) lines.push(`Quirurgicos: ${c.pastMedicalSurgical.surgicalHistory}`);
    lines.push(`Familiares: ${c.familyHistory?.nonContributory ? 'No contributorio' : (c.familyHistory?.details || 'Sin antecedentes de interes')}`);
    lines.push(`Habitos y Sociales: Alcohol: ${c.socialHistory?.etoh ? 'Si' : 'No'} | Tabaco: ${c.socialHistory?.tobaccoUse ? `Si (${c.socialHistory.tobaccoPackYears || ''} paq/ano)` : 'No'} | Sustancias: ${c.socialHistory?.ivda ? 'Si' : 'No'}`);
    if (c.socialHistory?.occupation) lines.push(`Ocupacion: ${c.socialHistory.occupation}`);
    lines.push(``);
    lines.push(`--- EXAMEN FISICO ---`);
    const v = c.physicalExam?.vitals;
    lines.push(`Signos vitales: T: ${v?.temperature || '--'} C | Pulso: ${v?.pulse || '--'} lpm (${v?.pulseRhythm || 'reg'}) | PA: ${v?.bloodPressure || '--'} mmHg (${v?.bpPosition || 'sentado'}) | FR: ${v?.respiratoryRate || '--'} rpm | Peso: ${v?.weight || '--'} kg | Talla: ${v?.height || '--'} m`);
    if (c.physicalExam?.appearance) lines.push(`Aspecto general: ${c.physicalExam.appearance}`);
    if (c.physicalExam?.abnormalFindingsSummary) lines.push(`Hallazgos anormales detallados: ${c.physicalExam.abnormalFindingsSummary}`);
    lines.push(``);
    lines.push(`--- REVISION DE DATOS Y PLAN ---`);
    lines.push(`Estudios y paraclinicos: ${c.dataReview || 'Pendientes / Sin registrar'}`);
    lines.push(`Diagnosticos: ${c.diagnosesList?.join('; ') || 'En estudio'}`);
    lines.push(`Evaluacion y Plan: ${c.assessmentPlan || 'Continuar observacion'}`);
    lines.push(``);
    lines.push(`Firma del Residente / Evaluador: ${c.residentSignature || 'Pendiente'} | Fecha: ${c.residentDate || c.date} | Hora: ${c.residentTime || c.time}`);
    lines.push(`========================================================================`);

    return lines.join('\n');
  }
}
