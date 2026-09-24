# Especificación de Requerimientos de Software (SRS)

**Proyecto:** Sistema de Digitalización, Trazabilidad y Análisis de Historias Clínicas  
**Entorno de Aplicación:** Consultorio Médico del Dr. Oscar Rueda  
**Estándar de Referencia:** IEEE Std 830 / ISO/IEC/IEEE 29148  

---

## 1. Introducción

### 1.1 Propósito
El propósito de este documento es especificar los requerimientos funcionales y no funcionales para el sistema web de registro, seguimiento cronológico y análisis de historias clínicas del Consultorio Médico del Dr. Oscar Rueda. Los requerimientos aquí descritos definen condiciones verificables y medibles para la implementación y aceptación del sistema.

### 1.2 Alcance del Sistema
El sistema comprende una aplicación web orientada a:
- Registrar datos de pacientes y notas clínicas estructuradas (visita hospitalaria inicial e interconsulta).
- Implementar control de acceso basado en roles (RBAC) y registro de auditoría de eventos de lectura y escritura.
- Desplegar una línea de tiempo cronológica de las atenciones de cada paciente.
- Consolidar reportes estadísticos de diagnósticos codificados en CIE-10 y evolución de tratamientos registrados.

### 1.3 Definiciones y Acrónimos
- **HPI (History of Present Illness):** Relato de la enfermedad actual desglosado en dimensiones semiológicas específicas.
- **ROS (Review of Systems):** Revisión por sistemas corporales estructurada en 14 aparatos.
- **CIE-10:** Clasificación Internacional de Enfermedades, décima edición.
- **IMC:** Índice de Masa Corporal, calculado mediante la fórmula: peso (kg) / [talla (m)]².
- **RBAC (Role-Based Access Control):** Control de acceso basado en roles.
- **JWT (JSON Web Token):** Estándar de transmisión de afirmaciones de identidad (RFC 7519) firmado digitalmente.
- **Bitácora de Auditoría:** Tabla de registros que almacena usuario, fecha, hora, dirección IP y acción ejecutada.

### 1.4 Contexto y Pregunta Problema
- **Situación Base:** El consultorio del Dr. Oscar Rueda opera con historias clínicas físicas en papel, lo cual impide la indexación computacional de registros, restringe la búsqueda de antecedentes a la revisión manual carpeta por carpeta, y no permite el cruce automático de variables diagnósticas o terapéuticas.
- **Pregunta Problema:** *¿De qué manera el desarrollo de un sistema de digitalización y análisis de historias clínicas permitirá garantizar la trazabilidad de los datos, facilitar el control del progreso de los pacientes y apoyar la toma de decisiones médicas en el consultorio del Dr. Oscar Rueda?*

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
El sistema opera bajo una arquitectura desacoplada de dos capas:
- **Cliente Web:** Interfaz construida en React y TypeScript, con comunicación asíncrona hacia la API mediante peticiones HTTP/JSON y almacenamiento temporal en LocalStorage.
- **Servidor Backend:** Servicio REST implementado en Node.js con Express y TypeScript bajo arquitectura por capas (Controladores, Servicios, Repositorios), conectado a PostgreSQL con esquema relacional y almacenamiento de respaldo en memoria local.

### 2.2 Roles de Usuario
El sistema define dos perfiles con permisos mutuamente excluyentes en áreas sensibles:

| Rol | Descripción | Permisos Asignados |
| :--- | :--- | :--- |
| **Administrador** | Encargado del mantenimiento técnico del sistema. | Gestión de usuarios (creación, activación, desactivación), edición de catálogos médicos y lectura de bitácora de auditoría. No posee permisos de lectura ni escritura sobre las notas clínicas de los pacientes. |
| **Doctor** | Profesional asistencial de la salud. | Registro y consulta de datos demográficos de pacientes, registro y consulta de historias clínicas, visualización de la línea de tiempo del paciente y consulta de reportes estadísticos de diagnósticos y tratamientos. |

### 2.3 Restricciones Generales
- Las notas clínicas guardadas no podrán ser eliminadas de la base de datos; cualquier modificación posterior debe registrarse como una nueva nota de evolución con fecha y hora independiente.
- Toda petición enviada al servidor backend que involucre datos de pacientes debe contener un encabezado HTTP `Authorization` con un token JWT válido.

---

## 3. Requerimientos Específicos

### 3.1 Requerimientos Funcionales (RF)

#### Módulo 1: Autenticación y Control de Acceso
- **RF-01 Autenticación de Usuarios:** El sistema debe autenticar las credenciales de entrada (identificador de usuario y contraseña) comparando la contraseña ingresada con el hash bcrypt almacenado, retornando un token JWT firmado mediante algoritmo HMAC-SHA256 con tiempo de expiración determinado.
- **RF-02 Validación de Rol por Endpoint:** El servidor debe verificar el rol decodificado del token JWT en cada solicitud HTTP antes de ejecutar la lógica del controlador, retornando el código HTTP 403 Forbidden si el rol no coincide con los permisos requeridos.
- **RF-03 Administración de Usuarios:** El Administrador debe poder crear nuevos usuarios, cambiar el estado del usuario entre activo e inactivo, y actualizar la contraseña asignada.

#### Módulo 2: Padrón de Pacientes
- **RF-04 Registro de Datos Demográficos:** El sistema debe capturar y validar los siguientes campos obligatorios para cada paciente: número de identificación, tipo de documento, nombres, apellidos, fecha de nacimiento, sexo biológico y teléfono. Opcionalmente debe admitir correo, ocupación y dirección.
- **RF-05 Búsqueda de Pacientes por Criterio:** El sistema debe filtrar el listado de pacientes por coincidencia de subcadena en número de identificación, nombres o apellidos, devolviendo los registros coincidentes.
- **RF-06 Ficha Consolidada del Paciente:** El sistema debe desplegar en una vista única los datos demográficos del paciente seleccionado, la lista de alergias registradas y el listado de todas las notas clínicas asociadas ordenadas descendentemente por fecha.

#### Módulo 3: Historia Clínica Digital e Interconsulta
- **RF-07 Captura Estructurada de la Consulta:** El sistema debe registrar las consultas dividiendo la información en tres etapas secuenciales:
  - *Etapa 1 (Historia):* Tipo de atención (Visita Inicial o Interconsulta con médico solicitante), estado de alergias (casilla NKDA o selección de alérgenos), medicación activa con conciliación, motivo de consulta, caracterización del HPI en 8 campos (localización, calidad, duración, temporalidad, severidad, contexto, factores modificadores, síntomas asociados), tabla de revisión por sistemas (ROS) de 14 aparatos con selector binario Normal/Anormal y campo de texto para observaciones, y antecedentes médicos, familiares y sociales.
  - *Etapa 2 (Examen Físico):* Campos para temperatura (°C), pulso (lpm con selector regular/irregular), presión arterial (mmHg con selector sentado/supino), frecuencia respiratoria (rpm), peso (kg) y talla (m), con cálculo de IMC y casillas de verificación para 12 sistemas anatómicos más exploración genitourinaria (masculina, femenina o no realizada).
  - *Etapa 3 (Plan y Cierre):* Campo de texto para revisión de estudios paraclínicos, lista de diagnósticos asociados con código CIE-10, campo de texto para evaluación y plan de manejo, nombre/identificación del evaluador, fecha y hora de cierre.
- **RF-08 Selección Asistida por Catálogo (Select2):** Los campos de alergias, medicamentos, antecedentes patológicos, motivos de consulta y diagnósticos deben permitir buscar opciones predefinidas mediante consultas con debounce de 200 ms al backend, y permitir la adición manual de términos no contenidos en el catálogo.
- **RF-09 Exportación Imprimible y Copia en Texto Plano:** El sistema debe generar una vista de la consulta estructurada que oculte los elementos de navegación al invocar el diálogo de impresión del navegador (`@media print`), y proveer una función que copie el resumen completo en texto plano al portapapeles del sistema operativo.

#### Módulo 4: Seguimiento y Trazabilidad del Paciente
- **RF-10 Línea de Tiempo del Paciente:** El sistema debe listar cronológicamente todas las atenciones previas del paciente, mostrando fecha, hora, tipo de atención, diagnóstico principal y médico tratante.
- **RF-11 Registro Histórico de Signos Vitales:** El sistema debe almacenar cada conjunto de signos vitales capturados en las consultas del paciente para permitir su comparación cronológica tabulada.
- **RF-12 Historial de Prescripciones Farmacológicas:** El sistema debe desplegar la lista consolidada de medicamentos registrados en las diferentes fechas de atención del paciente, indicando el estado del tratamiento en cada visita.

#### Módulo 5: Análisis Clínico y Estadísticas
- **RF-13 Conteo y Frecuencia de Diagnósticos (CIE-10):** El sistema debe calcular y mostrar el número total de ocurrencias de cada código CIE-10 registrado en el consultorio, permitiendo filtrar los resultados por intervalo de fechas (fecha inicio y fecha fin).
- **RF-14 Consulta de Casos por Diagnóstico Compartido:** El sistema debe permitir al Doctor seleccionar un código CIE-10 y desplegar la lista de tratamientos, planes y evoluciones registrados previamente en otros pacientes con ese mismo código.

#### Módulo 6: Auditoría y Catálogos (Administrador)
- **RF-15 Registro de Auditoría de Acciones:** El sistema debe insertar en la tabla de auditoría un registro por cada evento de autenticación, lectura de expediente de paciente, creación de consulta o modificación de usuarios, almacenando: `id_usuario`, `rol`, `tipo_accion`, `recurso_afectado`, `direccion_ip` y `timestamp`.
- **RF-16 Gestión de Catálogos:** El Administrador debe poder consultar y registrar nuevos ítems en las tablas de catálogo (categoría, código y nombre).

---

## 4. Requerimientos No Funcionales (RNF)

#### RNF-01 Cifrado de Contraseñas
- El sistema debe almacenar las contraseñas de los usuarios transformadas mediante la función hash bcrypt con un factor de trabajo (salt rounds) no menor a 10. No se admitirá almacenamiento en texto claro.

#### RNF-02 Firma y Verificación de Tokens
- Los tokens de sesión deben estar firmados digitalmente mediante el estándar JWT y contener una fecha de expiración máxima de 8 horas desde su emisión.

#### RNF-03 Tiempo de Respuesta en Búsquedas Predictivas
- Los endpoints de consulta de catálogos (`/api/catalogos/:categoria?q=...`) deben responder en un tiempo inferior o igual a 300 milisegundos para bases de datos de hasta 10.000 registros en entorno de red local.

#### RNF-04 Tiempo de Carga Inicial
- El paquete inicial de la interfaz web servido por el servidor HTTP debe completar su descarga y renderizado del primer contenido visible en menos de 2.0 segundos bajo una conexión de red local.

#### RNF-05 Integridad y Formato Temporal
- Todas las marcas de tiempo almacenadas en la base de datos deben utilizar el tipo de dato `TIMESTAMP WITH TIME ZONE` en formato ISO 8601 (UTC).

#### RNF-06 Retención de Datos en el Cliente
- La interfaz de usuario debe guardar el estado del formulario de consulta en `localStorage` ante cada modificación de campo, restaurándolo automáticamente si la página es recargada antes del envío.

#### RNF-07 Inmutabilidad de la Bitácora de Auditoría
- La tabla de auditoría no debe disponer de rutas HTTP ni procedimientos que ejecuten sentencias `UPDATE` o `DELETE` sobre sus registros.

#### RNF-08 Compatibilidad de Navegadores
- La aplicación cliente debe operar sin errores de sintaxis ni bloqueos en las dos versiones estables más recientes de los navegadores Google Chrome, Mozilla Firefox y Microsoft Edge.

#### RNF-09 Tolerancia a Fallos de Conexión de Base de Datos
- Si la conexión al puerto de PostgreSQL falla al iniciar el servidor backend, el sistema debe registrar el evento en la consola, habilitar el repositorio de datos en memoria local y continuar escuchando peticiones HTTP en el puerto configurado.

---

## 5. Matriz de Roles y Permisos (RBAC)

| Operación del Sistema | Administrador | Doctor |
| :--- | :---: | :---: |
| Autenticación con usuario y contraseña | Habilitado | Habilitado |
| Crear y modificar cuentas de usuario | Habilitado | Inhabilitado |
| Registrar nuevos pacientes | Habilitado | Habilitado |
| Consultar listado demográfico de pacientes | Habilitado | Habilitado |
| Registrar consulta o interconsulta médica | Inhabilitado | Habilitado |
| Leer notas clínicas y planes de manejo | Inhabilitado | Habilitado |
| Visualizar línea de tiempo y signos vitales históricos | Inhabilitado | Habilitado |
| Consultar reporte estadístico de diagnósticos (CIE-10) | Inhabilitado | Habilitado |
| Filtrar casos clínicos por diagnóstico previo | Inhabilitado | Habilitado |
| Consultar bitácora de auditoría | Habilitado | Inhabilitado |
| Registrar términos en catálogos del sistema | Habilitado | Habilitado (durante la captura) |

---

## 6. Matriz de Cobertura: Requerimientos vs Situación del Consultorio

| Factor de la Situación en Papel | Limitación Operativa | Requerimiento que Implementa la Solución | Criterio de Verificación |
| :--- | :--- | :--- | :--- |
| **Almacenamiento en papel** | Tiempo requerido para ubicar físicamente una carpeta archivada. | **RF-04, RF-05, RF-06** | Búsqueda por documento o nombre con respuesta menor a 300 ms. |
| **Pérdida de trazabilidad** | Dificultad para ordenar cronológicamente las hojas de diferentes fechas. | **RF-07, RF-10, RF-11, RNF-05** | Lista cronológica ordenada por timestamp ISO 8601 sin opción de borrado. |
| **Vulnerabilidad de acceso a los datos** | El expediente físico puede ser leído por personas no autorizadas sin dejar rastro. | **RF-01, RF-02, RF-15, RNF-01, RNF-07** | Validación de JWT por endpoint y registro de cada lectura en tabla inmutable de auditoría. |
| **Falta de consolidación de información** | Imposibilidad de tabular manualmente diagnósticos frecuentes o tratamientos en papel. | **RF-13, RF-14** | Cálculo automatizado de frecuencias de códigos CIE-10 y filtro por diagnóstico compartido. |
| **Tiempo de digitación en consulta** | Redacción manual repetitiva de exploraciones y recetas completas. | **RF-08, RNF-06** | Selección con autocompletado en catálogos y respaldo de borrador en LocalStorage. |
