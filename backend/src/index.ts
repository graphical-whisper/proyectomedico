import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, getDbConnectionStatus } from './config/database.js';
import { initializeDatabaseSchema } from './repositories/initDb.js';
import catalogRoutes from './routes/catalogRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rutas de API
app.use('/api/catalogos', catalogRoutes);
app.use('/api/consultas', consultationRoutes);

// Endpoint de estado y verificacion
app.get('/api/salud', (_req, res) => {
  res.json({
    status: 'ok',
    servicio: 'Inpatient Consult Backend API',
    databaseConnected: getDbConnectionStatus(),
    timestamp: new Date().toISOString()
  });
});

// Inicializacion del servidor
async function startServer() {
  console.log('Iniciando servidor de Interconsultas Medicas...');
  
  const connected = await testConnection();
  if (connected) {
    try {
      await initializeDatabaseSchema();
    } catch (e: any) {
      console.warn('Error inicializando tablas en PostgreSQL:', e.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error fatal al iniciar la aplicacion:', err);
});
