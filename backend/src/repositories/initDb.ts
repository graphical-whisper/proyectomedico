import { pool } from '../config/database.js';
import { INITIAL_CATALOGS } from './catalogData.js';

export async function initializeDatabaseSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('Iniciando verificacion y migracion del esquema en PostgreSQL...');

    // 1. Tabla de catalogos para autocompletado tipo Select2
    await client.query(`
      CREATE TABLE IF NOT EXISTS catalog_items (
        id VARCHAR(64) PRIMARY KEY,
        category VARCHAR(64) NOT NULL,
        code VARCHAR(64),
        name TEXT NOT NULL,
        description TEXT,
        frequency INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indice para busquedas textuales rapidas
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_catalog_category_name ON catalog_items(category, name);
    `);

    // 2. Tabla principal de consultas hospitalarias
    await client.query(`
      CREATE TABLE IF NOT EXISTS inpatient_consultations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_name VARCHAR(255) NOT NULL,
        patient_id_number VARCHAR(64),
        consult_date DATE NOT NULL,
        consult_time TIME NOT NULL,
        visit_type VARCHAR(32) NOT NULL,
        requesting_physician VARCHAR(255),
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Poblar catalogos si la tabla esta vacia
    const countRes = await client.query('SELECT COUNT(*) FROM catalog_items');
    const count = parseInt(countRes.rows[0].count, 10);
    if (count === 0) {
      console.log('Insertando datos semilla para catalogos medicos...');
      for (const item of INITIAL_CATALOGS) {
        await client.query(
          `INSERT INTO catalog_items (id, category, code, name, description, frequency)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [item.id, item.category, item.code || null, item.name, item.description || null, item.frequency || 0]
        );
      }
      console.log(`Se insertaron ${INITIAL_CATALOGS.length} registros en el catalogo.`);
    }

    console.log('Esquema de base de datos verificado con exito.');
  } finally {
    client.release();
  }
}

// Permitir ejecucion directa por terminal
if (process.argv[1] && process.argv[1].endsWith('initDb.ts')) {
  initializeDatabaseSchema()
    .then(() => {
      console.log('Migracion inicial de base de datos completada.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error durante la migracion de base de datos:', err);
      process.exit(1);
    });
}
