import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'hospital_consultas_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

let isDbConnected = false;

export async function testConnection(retries: number = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      isDbConnected = true;
      client.release();
      console.log('Conexion a PostgreSQL establecida correctamente en ' + (process.env.DB_NAME || 'hospital_consultas_db'));
      return true;
    } catch (error: any) {
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, 800));
        continue;
      }
      isDbConnected = false;
      console.warn('Aviso: No se pudo conectar a PostgreSQL local (' + error.message + ').');
      console.warn('El backend operara con repositorio de contingencia en memoria para catalogos y consultas.');
      return false;
    }
  }
  return false;
}

export function getDbConnectionStatus(): boolean {
  return isDbConnected;
}
