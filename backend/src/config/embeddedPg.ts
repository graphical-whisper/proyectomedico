import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';
import fs from 'fs';
import net from 'net';

let pgInstance: any = null;

function checkPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

export async function ensureLocalPostgres(): Promise<boolean> {
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const dbName = process.env.DB_NAME || 'hospital_consultas_db';

  const isPortActive = await checkPortInUse(port);
  if (isPortActive) {
    console.log(`Detectado servicio PostgreSQL activo en puerto ${port}.`);
    return true;
  }

  console.log(`Iniciando instancia local de PostgreSQL en puerto ${port}...`);

  const dataDir = path.join(process.cwd(), 'data', 'db');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  try {
    const PgConstructor = (EmbeddedPostgres as any).default || EmbeddedPostgres;
    pgInstance = new PgConstructor({
      databaseDir: dataDir,
      user,
      password,
      port,
      persistent: true,
      onLog: () => {},
      onError: () => {}
    });

    const isInitialized = fs.existsSync(path.join(dataDir, 'PG_VERSION'));
    if (!isInitialized) {
      console.log('Inicializando cluster de base de datos PostgreSQL en data/db...');
      await pgInstance.initialise();
    }

    await pgInstance.start();
    console.log(`Servidor PostgreSQL local listo y escuchando en puerto ${port}.`);

    // Crear la base de datos si no existe
    try {
      await pgInstance.createDatabase(dbName);
      console.log(`Base de datos '${dbName}' verificada/creada.`);
    } catch {
      // Ya existe
    }

    // Registrar apagado ordenado del proceso Postgres
    const cleanExit = async () => {
      if (pgInstance) {
        try {
          await pgInstance.stop();
        } catch {
          // Ignorar al salir
        }
      }
    };

    process.on('SIGINT', async () => {
      await cleanExit();
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      await cleanExit();
      process.exit(0);
    });

    return true;
  } catch (err: any) {
    console.warn('Aviso: No se pudo iniciar PostgreSQL local automaticamente:', err.message);
    return false;
  }
}
