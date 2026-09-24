# Especificación de Requerimientos de Software (SRS)

**Proyecto:** Sistema de Digitalización, Trazabilidad y Análisis de Historias Clínicas  
**Entorno de Aplicación:** Consultorio Médico del Dr. Oscar Rueda  
**Estándar de Referencia:** IEEE Std 830 / ISO/IEC/IEEE 29148  

---

## 1. Introducción

### 1.1 Propósito
El propósito del presente documento es formalizar la especificación completa de requerimientos funcionales y no funcionales para el sistema web de digitalización, seguimiento evolutivo y análisis de historias clínicas del Consultorio Médico del Dr. Oscar Rueda. Este documento define el alcance operativo, la matriz de responsabilidades por rol y los criterios de aceptación para el desarrollo técnico del software.

### 1.2 Alcance del Sistema
El sistema comprende una solución de software web integral orientada a:
- Sustituir el expediente clínico en papel por registros clínicos digitales estructurados conforme a los estándares de notas hospitalarias e interconsultas.
- Garantizar la seguridad, confidencialidad y custodia legal de los datos de salud mediante control de acceso basado en roles (RBAC) y auditoría de eventos.
- Proporcionar herramientas interactivas de seguimiento cronológico para evaluar la evolución temporal del paciente frente a diferentes tratamientos.
- Consolidar tableros analíticos y estadísticos de diagnósticos (CIE-10), motivos de consulta y efectividad terapéutica para respaldar la toma de decisiones clínicas basadas en datos.

### 1.3 Definiciones, Acrónimos y Abreviaturas
- **HPI (History of Present Illness):** Historia o relato estructurado de la enfermedad actual.
- **ROS (Review of Systems):** Revisión por sistemas o interrogatorio médico por aparatos y sistemas corporales.
- **CIE-10:** Clasificación Internacional de Enfermedades, décima edición.
- **IMC:** Índice de Masa Corporal.
- **RBAC (Role-Based Access Control):** Control de acceso basado en roles.
- **JWT (JSON Web Token):** Estándar abierto para la transmisión segura de afirmaciones de identidad entre partes.
- **Log de Auditoría:** Registro cronológico e inmutable de eventos, modificaciones y accesos al expediente médico.

### 1.4 Referencias y Formulación del Problema
- **Problema Central:** El consultorio médico del Dr. Oscar Rueda maneja sus expedientes en formato físico de papel, lo cual ocasiona retrasos significativos en la localización de antecedentes, vulnerabilidades en la privacidad y custodia física de los datos, e imposibilidad técnica de cruzar información histórica para evaluar tendencias clínicas y efectividad de tratamientos.
- **Pregunta Problema:** *¿De qué manera el desarrollo de un sistema de digitalización y análisis de historias clínicas permitirá garantizar la trazabilidad de los datos, facilitar el control del progreso de los pacientes y apoyar la toma de decisiones médicas en el consultorio del Dr. Oscar Rueda?*

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
El sistema se implanta como una aplicación web modular con arquitectura cliente-servidor desacoplada:
- **Cliente Web:** Construido en React con TypeScript y Vite, optimizado para consulta rápida, captura ágil mediante componentes con búsqueda predictiva (estilo Select2) y visualización gráfica de evolución de pacientes.
- **Servidor Backend:** Construido en Node.js con Express y TypeScript bajo arquitectura por capas MVC+, comunicándose con una base de datos relacional PostgreSQL con capacidad de contingencia controlada.

### 2.2 Roles de Usuario
El sistema opera estrictamente bajo dos perfiles de usuario:

| Rol | Descripción | Enfoque de Permisos |
| :--- | :--- | :--- |
| **Administrador** | Responsable de la gestión técnica y operativa del consultorio. | Gestión de cuentas de usuario, configuración de catálogos médicos, supervisión de registros de auditoría y respaldo de base de datos. Sin acceso a la intimidad confidencial de las notas médicas. |
| **Doctor** | Profesional médico asistencial (Dr. Oscar Rueda y especialistas autorizados). | Creación y actualización de historias clínicas, consulta de expedientes, registro de evoluciones, visualización de líneas de tiempo de pacientes y acceso al módulo de analítica clínica. |

### 2.3 Restricciones Generales
- Las notas médicas refrendadas y firmadas no podrán ser eliminadas; cualquier rectificación o nueva observación clínica debe asentarse mediante una nota de evolución con fecha y hora exacta para garantizar la validez legal del expediente.
- Toda consulta o alteración de datos sensibles debe registrarse en la bitácora de auditoría vinculada al identificador del usuario autenticado.

---

## 3. Requerimientos Específicos

### 3.1 Requerimientos Funcionales (RF)

#### Módulo 1: Autenticación, Seguridad y Gestión de Cuentas
- **RF-01 Inicio de Sesión Seguro:** El sistema debe autenticar a los usuarios mediante credenciales únicas (correo/nombre de usuario y contraseña cifrada con algoritmo seguro bcrypt), emitiendo un token JWT firmado.
- **RF-02 Control de Acceso por Roles (RBAC):** El sistema debe validar en cada petición que el usuario cuente con el rol requerido (Administrador o Doctor) antes de autorizar la ejecución del endpoint correspondiente.
- **RF-03 Gestión de Usuarios (Administrador):** El Administrador debe poder crear, editar el estado (activo/inactivo), restablecer credenciales y listar las cuentas de doctores y administradores del consultorio.

#### Módulo 2: Padrón y Gestión de Pacientes
- **RF-04 Registro de Pacientes:** El sistema debe permitir registrar datos demográficos de pacientes: nombres, apellidos, tipo y número de documento, fecha de nacimiento, sexo, teléfono de contacto, correo, ocupación y dirección de residencia.
- **RF-05 Búsqueda Rápida de Expedientes:** El sistema debe proveer una barra de búsqueda predictiva en tiempo real que permita localizar a cualquier paciente por número de identificación, nombres o apellidos en menos de 1 segundo.
- **RF-06 Ficha del Paciente:** El sistema debe presentar una vista unificada con el resumen demográfico, alertas clínicas permanentes (alergias graves conocidas) y el historial consolidado de visitas e interconsultas.

#### Módulo 3: Historia Clínica Digital e Interconsulta
- **RF-07 Registro Estructurado de Visita/Interconsulta:** El sistema debe capturar las notas clínicas divididas en las tres etapas médicas estandarizadas:
  - *Etapa 1:* Datos de visita, conciliación de medicamentos, alergias (NKDA / lista), motivo de consulta caracterizado en 8 dimensiones semiológicas (localización, calidad, duración, temporalidad, severidad, contexto, modificadores, síntomas asociados), revisión por sistemas (ROS) de 14 sistemas corporales y antecedentes médicos/familiares/sociales.
  - *Etapa 2:* Signos vitales con cálculo automatizado del IMC y categoría nutricional, y examen físico multisistémico con casillas de normalidad predeterminadas y resumen de hallazgos anormales.
  - *Etapa 3:* Revisión de estudios paraclínicos, codificación de diagnósticos con catálogo CIE-10, plan de manejo terapéutico y firma profesional con fecha/hora.
- **RF-08 Autocompletado Select2 Asistido por Catálogo:** Los campos clínicos (alergias, medicamentos, síntomas, antecedentes y diagnósticos) deben funcionar con búsqueda incremental en tiempo real, permitiendo seleccionar términos predefinidos o ingresar términos médicos nuevos sin bloquear la captura.
- **RF-09 Generación de Reporte Clínico e Impresión / PDF:** El sistema debe permitir generar la visualización formal de la nota clínica en formato imprimible con diseño institucional limpio mediante reglas de impresión `@media print`, así como la opción de copiar el texto plano estructurado al portapapeles.

#### Módulo 4: Seguimiento Evolutivo y Trazabilidad del Paciente
- **RF-10 Línea de Tiempo Evolutiva (Timeline del Paciente):** El Doctor debe poder visualizar de forma cronológica e interactiva todas las atenciones médicas del paciente, identificando fechas, motivos de consulta, diagnósticos asignados y conductas adoptadas.
- **RF-11 Gráficas de Tendencia de Signos Vitales:** El sistema debe graficar la evolución histórica de variables clave del paciente a lo largo de sus visitas sucesivas (Presión Arterial sistólica/diastólica, Frecuencia Cardíaca, Peso e IMC).
- **RF-12 Trazabilidad de Tratamientos y Medicación:** El sistema debe permitir contrastar las prescripciones farmacológicas previas frente a las actuales para evaluar la respuesta clínica del paciente a lo largo del tiempo.

#### Módulo 5: Analítica Clínica y Soporte a Decisiones Médicas
- **RF-13 Panel Estadístico de Diagnósticos (CIE-10):** El sistema debe calcular y mostrar al Doctor la distribución de patologías más frecuentes atendidas en el consultorio, filtrable por rangos de fecha y grupos de edad.
- **RF-14 Análisis de Correlación y Decisiones Similares:** El sistema debe permitir al Doctor consultar qué intervenciones, esquemas de medicación y conductas terapéuticas han demostrado eficacia en pacientes con diagnósticos o cuadros clínicos equivalentes dentro del histórico del consultorio.

#### Módulo 6: Auditoría y Administración de Catálogos (Administrador)
- **RF-15 Registro de Auditoría Inmutable:** El sistema debe almacenar automáticamente un registro de cada acción crítica (inicio de sesión, consulta de expediente, registro de consulta, modificación de parámetros) indicando: identificador de usuario, rol, fecha, hora, dirección IP y recurso afectado.
- **RF-16 Mantenimiento de Catálogos Médicos:** El Administrador debe poder inspeccionar, actualizar y agregar nuevos términos al catálogo de medicamentos, diagnósticos y hallazgos.

---

### 3.2 Requerimientos No Funcionales (RNF)

#### RNF-01: Seguridad y Confidencialidad de Datos Médicos
- Las contraseñas deben almacenarse procesadas mediante función hash unidireccional bcrypt con factor de costo mínimo de 10.
- La comunicación entre cliente y servidor debe viajar sobre protocolo HTTPS en producción.
- Los tokens JWT deben contar con firma criptográfica y tiempo de expiración definido.

#### RNF-02: Trazabilidad y Fidelidad Legal
- La base de datos debe preservar la integridad referencial y marcas de tiempo (`created_at`, `updated_at`) en formato ISO 8601 con zona horaria.
- Las bitácoras de auditoría no podrán ser editadas ni eliminadas desde la interfaz de usuario.

#### RNF-03: Rendimiento y Eficiencia
- El tiempo de respuesta de los endpoints de búsqueda predictiva (Select2) no debe exceder los 300 ms en condiciones de red local.
- La carga inicial de la aplicación web en el navegador debe completarse en menos de 2 segundos.

#### RNF-04: Usabilidad y Ergonomía Clínica
- La interfaz debe minimizar la carga de digitación del médico mediante botones de marcado rápido ("Marcar examen estándar normal", "Todos los sistemas normales en ROS") y componentes con debounce para evitar latencia al escribir.
- El asistente por pasos (Wizard) debe prevenir la pérdida involuntaria de datos guardando continuamente el borrador en memoria local del navegador.

#### RNF-05: Disponibilidad y Tolerancia a Fallos
- En caso de indisponibilidad temporal del motor de base de datos PostgreSQL, el sistema debe alertar al usuario y conmutar a almacenamiento de contingencia para no interrumpir la atención médica en curso.

#### RNF-06: Portabilidad y Compatibilidad
- La interfaz web debe ser plenamente compatible con las versiones actuales de navegadores estándar basados en Chromium, Gecko y WebKit en sistemas operativos de escritorio.

---

## 4. Matriz de Roles y Permisos (RBAC)

| Módulo / Operación | Administrador | Doctor |
| :--- | :---: | :---: |
| Iniciar sesión y autenticarse | Permitido | Permitido |
| Gestionar cuentas de usuario (crear, bloquear) | Permitido | Denegado |
| Registrar nuevo paciente | Permitido | Permitido |
| Buscar y consultar lista de pacientes | Solo datos demográficos | Acceso completo |
| Registrar nueva consulta / visita / interconsulta | Denegado | Permitido |
| Consultar notas médicas de historias clínicas | Denegado | Permitido |
| Ver línea de tiempo evolutiva del paciente | Denegado | Permitido |
| Ver gráficas históricas de signos vitales | Denegado | Permitido |
| Acceder al panel de analítica clínica y CIE-10 | Denegado | Permitido |
| Administrar y poblar catálogos médicos | Permitido | Consulta / Adición en consulta |
| Consultar bitácora de auditoría de accesos | Permitido | Denegado |

---

## 5. Matriz de Alineación: Requerimientos vs Situación Problema

| Reto del Consultorio del Dr. Oscar Rueda | Impacto Negativo del Papel | Solución Digital Implementada | Requerimientos Asociados |
| :--- | :--- | :--- | :--- |
| **Demora en localización de antecedentes** | Búsqueda manual en archivadores físicos, expedientes extraviados o desorganizados. | Búsqueda predictiva instantánea por cédula/nombre y centralización de la ficha digital. | RF-05, RF-06 |
| **Pérdida de trazabilidad y cronología** | Hojas sueltas, notas ilegibles, dificultad para reconstruir la historia clínica integral. | Registro estructurado (3 etapas), marcas de tiempo automáticas y línea de tiempo evolutiva inmutable. | RF-07, RF-10, RNF-02 |
| **Vulnerabilidad de privacidad y custodia** | Acceso físico no controlado a carpetas de pacientes, sin registro de quién leyó la historia. | Autenticación JWT, segregación de roles (RBAC) y bitácora de auditoría de cada consulta o registro. | RF-01, RF-02, RF-15, RNF-01 |
| **Ausencia de análisis y apoyo a decisiones** | Imposibilidad práctica de tabular datos en papel para conocer prevalencias o efectividad de fármacos. | Tableros de analítica diagnóstica (CIE-10), gráficas de signos vitales y correlación de intervenciones previas. | RF-11, RF-12, RF-13, RF-14 |
| **Agilidad en la consulta diaria** | Sobrecarga de escritura manual repetitiva de datos normales y fármacos. | Catálogos con autocompletado Select2, marcado de normalidad estándar y cálculo automático de IMC. | RF-08, RNF-04 |
