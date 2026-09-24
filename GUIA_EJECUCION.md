# Guía de Ejecución y Puesta en Marcha

Este documento describe paso a paso cómo ejecutar la aplicación clínica localmente, tanto el servidor backend como la interfaz web de usuario.

---

## 1. Requisitos del Sistema

Para ejecutar esta aplicación se requiere:

- **Node.js**: Versión 18.0.0 o superior (instalado: v24.19.0).
- **npm**: Versión 9.0.0 o superior (instalado: 11.17.0).
- **PostgreSQL** *(Opcional)*: Si no está activo o instalado, el sistema opera automáticamente en modo de contingencia en memoria sin detener la ejecución.

---

## 2. Configuración Inicial (Variables de Entorno)

El archivo de configuración ya se encuentra generado en [backend/.env](file:///c:/Users/rauls/Desktop/proyectomedico/backend/.env):

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=hospital_consultas_db
```

Si dispone de un servidor PostgreSQL local con credenciales diferentes, actualice los valores en dicho archivo. Si no dispone de PostgreSQL, conserve los valores por defecto; la aplicación continuará funcionando en modo memoria.

---

## 3. Instalación de Dependencias

Si clona el proyecto en otra ubicación o requiere reinstalar paquetes:

### En el directorio del Backend:
```powershell
cd c:\Users\rauls\Desktop\proyectomedico\backend
npm install
```

### En el directorio del Frontend:
```powershell
cd c:\Users\rauls\Desktop\proyectomedico\frontend
npm install
```

---

## 4. Ejecución de la Aplicación

Para utilizar la aplicación completa se deben abrir **dos terminales** simultáneas:

### Terminal 1: Servidor Backend (API REST en Puerto 4000)

```powershell
cd c:\Users\rauls\Desktop\proyectomedico\backend
npm run dev
```

**Salida esperada:**
```text
Iniciando servidor de Interconsultas Medicas...
Servidor backend escuchando en http://localhost:4000
```

- Endpoint de verificación: [http://localhost:4000/api/salud](http://localhost:4000/api/salud)
- Endpoints de catálogos: `http://localhost:4000/api/catalogos/:categoria`
- Endpoints de consultas: `http://localhost:4000/api/consultas`

### Terminal 2: Servidor Frontend (Cliente Web en Puerto 3000)

```powershell
cd c:\Users\rauls\Desktop\proyectomedico\frontend
npm run dev
```

**Salida esperada:**
```text
  VITE v6.4.3  ready in 264 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## 5. Acceso al Formulario Web

1. Abra su navegador web e ingrese a:
   ```text
   http://localhost:3000/
   ```
2. Verifique la barra superior:
   - **PostgreSQL Activo** (indicador verde): Conexión establecida con la base de datos local.
   - **Modo Contingencia Local** (indicador ámbar): Operación en memoria con persistencia en borrador local.
3. El asistente se divide en tres etapas navegables:
   - **Etapa 1**: Identificación del paciente, motivo de consulta, HPI estructurado, revisión por sistemas (ROS) y antecedentes.
   - **Etapa 2**: Registro de signos vitales, cálculo dinámico de IMC y exploración multisistémica con marcado rápido de normalidad estándar.
   - **Etapa 3**: Revisión paraclínica, diagnósticos CIE-10 asistidos por catálogo Select2, evaluación/plan y firma médica.
4. Para exportar o imprimir:
   - Clic en **"Previsualizar e Imprimir / PDF"** para abrir el formato institucional e imprimir mediante el diálogo del sistema operativo (`Ctrl + P`).
   - Clic en **"Copiar Texto al Portapapeles"** para obtener el resumen clínico en formato plano.

---

## 6. Comandos Adicionales Disponibles

### Backend:
- Compilar TypeScript a JavaScript:
  ```powershell
  npm run build
  ```
- Ejecutar inicialización manual de base de datos PostgreSQL:
  ```powershell
  npm run db:init
  ```

### Frontend:
- Generar paquete de producción:
  ```powershell
  npm run build
  ```
- Previsualizar versión de producción:
  ```powershell
  npm run preview
  ```

---

## 7. Resolución de Problemas Frecuentes

1. **Error de puerto ocupado (EADDRINUSE: 4000 o 3000)**:
   - Si el puerto 4000 o 3000 está en uso por otro proceso, puede cerrarlo o modificar el puerto en [backend/.env](file:///c:/Users/rauls/Desktop/proyectomedico/backend/.env) o [frontend/vite.config.ts](file:///c:/Users/rauls/Desktop/proyectomedico/frontend/vite.config.ts).
2. **Aviso de conexión a PostgreSQL rechazada**:
   - Esto indica que el servicio de Postgres no se encuentra activo. No impide el funcionamiento de la aplicación; el backend cambiará automáticamente a almacenamiento en memoria.
3. **Pérdida de datos al recargar**:
   - El formulario cuenta con guardado continuo en [LocalStorage](file:///c:/Users/rauls/Desktop/proyectomedico/frontend/src/App.tsx). Para limpiar la información y empezar una consulta nueva, use el botón **"Nueva Nota"** en la barra superior.
