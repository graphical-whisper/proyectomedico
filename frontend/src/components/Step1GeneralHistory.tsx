import React, { useState } from 'react';
import { InpatientConsultation, ReviewOfSystems, FixedPathologies } from '../types/consultation.js';
import { Select2Search } from './Select2Search.js';

interface Step1Props {
  formData: InpatientConsultation;
  updateForm: (fields: Partial<InpatientConsultation>) => void;
  onNext: () => void;
}

const ROS_SYSTEMS_CONFIG: { key: keyof ReviewOfSystems; label: string; examples: string }[] = [
  { key: 'constitutional', label: 'Constitucional', examples: 'Fiebre, astenia, adinamia, perdida ponderal' },
  { key: 'eyes', label: 'Ojos', examples: 'Agudeza visual, dolor, secrecion, escotomas' },
  { key: 'ent', label: 'Oidos / Nariz / Boca / Garganta', examples: 'Hipoacusia, epistaxis, odinofagia, congestion' },
  { key: 'respiratory', label: 'Respiratorio', examples: 'Disnea, tos, expectoracion, dolor pleuritico' },
  { key: 'cardiovascular', label: 'Cardiovascular', examples: 'Dolor precordial, palpitaciones, ortopnea, DPN' },
  { key: 'gastrointestinal', label: 'Gastrointestinal', examples: 'Dolor abdominal, nauseas, vomito, melenas' },
  { key: 'genitourinary', label: 'Genitourinario', examples: 'Disuria, hematuria, coluria, tenesmo vesical' },
  { key: 'integumentary', label: 'Tegumentario (Piel y faneras)', examples: 'Prurito, exantemas, alopecia, lesiones' },
  { key: 'musculoskeletal', label: 'Musculoesqueletico', examples: 'Artralgias, mialgias, rigidez, inflamacion articular' },
  { key: 'neurologic', label: 'Neurologico', examples: 'Cefalea, sincope, parestesias, convulsiones' },
  { key: 'psychiatric', label: 'Psiquiatrico', examples: 'Animo, ansiedad, insomnio, ideacion' },
  { key: 'endocrinologic', label: 'Endocrinologico', examples: 'Poliuria, polidipsia, intolerancia termica' },
  { key: 'hematologic', label: 'Hematologico', examples: 'Petequias, equimosis espontaneas, adenomegalias' },
  { key: 'immunologic', label: 'Inmunologico', examples: 'Infecciones recurrentes, fenomenos alergicos' }
];

const FIXED_PATHOLOGY_ITEMS: { key: keyof FixedPathologies; label: string }[] = [
  { key: 'htaCronica', label: 'HTA Crónica' },
  { key: 'hipoTa', label: 'Hipotensión' },
  { key: 'dmnid', label: 'DMNID (Diabetes)' },
  { key: 'hipoglicemia', label: 'Hipoglicemia' },
  { key: 'dislipidemia', label: 'Dislipidemia' },
  { key: 'problemasTiroides', label: 'Problemas Tiroides' },
  { key: 'asma', label: 'Asma' },
  { key: 'epoc', label: 'EPOC' },
  { key: 'erc', label: 'Enfermedad Renal Crónica' },
  { key: 'cardiopatiaIsquemica', label: 'Cardiopatía Isquémica' },
  { key: 'obesidad', label: 'Obesidad' },
  { key: 'cancer', label: 'Cáncer' }
];

const COMMON_HEREDITARY_DISEASES = [
  'HTA',
  'Diabetes Mellitus',
  'Cáncer',
  'Cardiopatía',
  'Accidente Cerebrovascular (ACV)'
];

const BLOOD_TYPES = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-', 'No determinado'];

export const Step1GeneralHistory: React.FC<Step1Props> = ({
  formData,
  updateForm,
  onNext
}) => {
  const [manualGynecoToggle, setManualGynecoToggle] = useState<boolean>(false);

  const handleRosChange = (sysKey: string, field: 'normal' | 'comments', val: any) => {
    const currentRos = { ...formData.reviewOfSystems } as any;
    currentRos[sysKey] = {
      ...currentRos[sysKey],
      [field]: val
    };
    updateForm({ reviewOfSystems: currentRos });
  };

  const handleMarkAllRosNormal = () => {
    const updated = { ...formData.reviewOfSystems } as any;
    ROS_SYSTEMS_CONFIG.forEach(sys => {
      updated[sys.key] = { normal: true, comments: 'Sin sintomatologia actual referida' };
    });
    updated.remainderNegative = true;
    updateForm({ reviewOfSystems: updated });
  };

  const handleFixedPathologyToggle = (key: keyof FixedPathologies, value: boolean) => {
    const currentFixed = { ...(formData.pastMedicalSurgical?.fixedPathologies || {}) } as FixedPathologies;
    updateForm({
      pastMedicalSurgical: {
        ...formData.pastMedicalSurgical,
        fixedPathologies: {
          ...currentFixed,
          [key]: value
        }
      }
    });
  };

  const isFemale = formData.biologicalSex === 'F';
  const showGynecology = isFemale || manualGynecoToggle;

  return (
    <div className="step-container animate-fade-in">
      {/* 1. SECCION: IDENTIFICACION Y DATOS DEMOGRAFICOS */}
      <div className="clinical-card">
        <div className="card-header">
          <div className="card-badge">Formato Consultorio Dr. Oscar Rueda</div>
          <h2 className="card-title">Datos Generales e Identificación del Paciente</h2>
          <p className="card-description">Filiación demográfica, aseguramiento y tipo de atención médica</p>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label required">Nombre Completo del Paciente</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Ítalo Estupiñán"
              value={formData.patientName}
              onChange={(e) => updateForm({ patientName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">N° de Cédula / Historia Clínica</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. 1098765432"
              value={formData.patientIdNumber || ''}
              onChange={(e) => updateForm({ patientIdNumber: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Entidad / Aseguradora</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Particular, EPS Sanitas, Sura..."
              value={formData.entity || ''}
              onChange={(e) => updateForm({ entity: e.target.value })}
            />
          </div>
        </div>

        <div className="form-grid-4 mt-3">
          <div className="form-group">
            <label className="form-label">Sexo Biológico</label>
            <div className="radio-group-container">
              <label className={`radio-pill ${formData.biologicalSex === 'M' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="biologicalSex"
                  value="M"
                  checked={formData.biologicalSex === 'M'}
                  onChange={() => updateForm({ biologicalSex: 'M' })}
                />
                Masculino
              </label>

              <label className={`radio-pill ${formData.biologicalSex === 'F' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="biologicalSex"
                  value="F"
                  checked={formData.biologicalSex === 'F'}
                  onChange={() => updateForm({ biologicalSex: 'F' })}
                />
                Femenino
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Edad</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. 44 años"
              value={formData.age || ''}
              onChange={(e) => updateForm({ age: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ocupación</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Comerciante frutas"
              value={formData.occupation || ''}
              onChange={(e) => updateForm({ occupation: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Procedencia</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Bucaramanga"
              value={formData.originCity || ''}
              onChange={(e) => updateForm({ originCity: e.target.value })}
            />
          </div>
        </div>

        <div className="form-grid-3 mt-3">
          <div className="form-group">
            <label className="form-label required">Tipo de Atención</label>
            <div className="radio-group-container">
              <label className={`radio-pill ${formData.visitType === 'initial_visit' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="visitType"
                  value="initial_visit"
                  checked={formData.visitType === 'initial_visit'}
                  onChange={() => updateForm({ visitType: 'initial_visit' })}
                />
                Visita Hospitalaria / Consulta
              </label>

              <label className={`radio-pill ${formData.visitType === 'consult' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="visitType"
                  value="consult"
                  checked={formData.visitType === 'consult'}
                  onChange={() => updateForm({ visitType: 'consult' })}
                />
                Interconsulta Médica
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Fecha de Atención</label>
            <input
              type="date"
              className="form-input"
              value={formData.date}
              onChange={(e) => updateForm({ date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Hora</label>
            <input
              type="time"
              className="form-input"
              value={formData.time}
              onChange={(e) => updateForm({ time: e.target.value })}
              required
            />
          </div>
        </div>

        {formData.visitType === 'consult' && (
          <div className="form-group mt-3 animate-slide-down">
            <label className="form-label required">Médico o Servicio Solicitante</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Dr. Sergio Alvernia - Medicina Interna"
              value={formData.requestingPhysician || ''}
              onChange={(e) => updateForm({ requestingPhysician: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* 2. SECCION: ALERGIAS Y MEDICAMENTOS */}
      <div className="clinical-card">
        <div className="card-header">
          <h2 className="card-title">Alergias y Medicación Habitual</h2>
          <p className="card-description">Conciliación de medicación y registro de reacciones adversas medicamentosas</p>
        </div>

        <div className="form-grid-2">
          {/* Bloque Alergias */}
          <div className="sub-panel">
            <div className="panel-title-row">
              <h3 className="panel-title">Alergias Medicamentosas</h3>
              <label className="checkbox-label highlight">
                <input
                  type="checkbox"
                  checked={formData.nkda}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    updateForm({
                      nkda: checked,
                      allergiesList: checked ? [] : formData.allergiesList
                    });
                  }}
                />
                Sin alergias conocidas (NKDA / (-))
              </label>
            </div>

            <Select2Search
              category="alergia"
              label="Buscar Alergias en Catálogo"
              placeholder="Escriba medicamento o sustancia alergénica (ej. Penicilina, AINEs)..."
              isMulti={true}
              values={formData.allergiesList}
              onChangeMulti={(vals) => {
                updateForm({
                  allergiesList: vals,
                  nkda: vals.length > 0 ? false : formData.nkda
                });
              }}
              disabled={formData.nkda}
              helperText="El catálogo contiene los alérgenos de mayor prevalencia precargados."
            />
          </div>

          {/* Bloque Medicamentos */}
          <div className="sub-panel">
            <div className="panel-title-row">
              <h3 className="panel-title">Medicación Activa</h3>
              <div className="checkbox-pills-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.otcMeds}
                    onChange={(e) => updateForm({ otcMeds: e.target.checked })}
                  />
                  Venta libre (OTC)
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.supplements}
                    onChange={(e) => updateForm({ supplements: e.target.checked })}
                  />
                  Suplementos
                </label>
              </div>
            </div>

            <Select2Search
              category="medicamento"
              label="Buscar Medicamentos Habituales"
              placeholder="Escriba fármaco, dosis o principio activo..."
              isMulti={true}
              values={formData.medicationsList}
              onChangeMulti={(vals) => updateForm({ medicationsList: vals })}
              helperText="Incluya dosis y posología reportada por el paciente o acudiente."
            />

            <div className="mt-3">
              <label className="checkbox-label note-check">
                <input
                  type="checkbox"
                  checked={formData.homeMedsConsidered}
                  onChange={(e) => updateForm({ homeMedsConsidered: e.target.checked })}
                />
                He considerado la lista de medicación domiciliaria al redactar las órdenes.
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECCION: MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL (HPI) */}
      <div className="clinical-card">
        <div className="card-header">
          <div className="card-badge">Dimensiones HPI</div>
          <h2 className="card-title">Motivo de Consulta y Enfermedad Actual</h2>
          <p className="card-description">Exploración estructurada de los elementos clínicos de la queja principal</p>
        </div>

        <div className="mb-4">
          <div className="panel-title-row">
            <label className="form-label required">Motivo de Consulta Principal</label>
            <label className="checkbox-label warning-check">
              <input
                type="checkbox"
                checked={formData.hpiUnableToObtain}
                onChange={(e) => updateForm({ hpiUnableToObtain: e.target.checked })}
              />
              No fue posible obtener historia clínica directa
            </label>
          </div>

          {!formData.hpiUnableToObtain ? (
            <Select2Search
              category="motivo_consulta"
              placeholder="Ej. Chequeo Médico, Epigastralgia, Dolor torácico..."
              isMulti={false}
              value={formData.chiefComplaint}
              onChangeSingle={(val) => updateForm({ chiefComplaint: val })}
            />
          ) : (
            <input
              type="text"
              className="form-input warning-input"
              placeholder="Indicar motivo (ej. Paciente intubado, estuporoso, sin acudiente)..."
              value={formData.hpiUnableReason || ''}
              onChange={(e) => updateForm({ hpiUnableReason: e.target.value })}
            />
          )}
        </div>

        {!formData.hpiUnableToObtain && (
          <div className="dimensions-box">
            <h4 className="dimensions-title">Caracterización Estructurada del Síntoma:</h4>
            <div className="form-grid-4">
              <div className="form-group">
                <label className="form-sublabel">1. Localización / Irradiación</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Epigastrio, retroesternal..."
                  value={formData.hpiLocation || ''}
                  onChange={(e) => updateForm({ hpiLocation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">2. Calidad / Carácter</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Urente, opresivo, punzante..."
                  value={formData.hpiQuality || ''}
                  onChange={(e) => updateForm({ hpiQuality: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">3. Duración</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. 15 días, 3 horas..."
                  value={formData.hpiDuration || ''}
                  onChange={(e) => updateForm({ hpiDuration: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">4. Temporalidad / Inicio</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Luego de ingesta de café..."
                  value={formData.hpiTiming || ''}
                  onChange={(e) => updateForm({ hpiTiming: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">5. Severidad / Intensidad</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Moderada (6/10 EVA)..."
                  value={formData.hpiSeverity || ''}
                  onChange={(e) => updateForm({ hpiSeverity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">6. Contexto de Presentación</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Manifiesta preocupación por..."
                  value={formData.hpiContext || ''}
                  onChange={(e) => updateForm({ hpiContext: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">7. Factores Modificadores</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Empeora con café o ayuno prolongado..."
                  value={formData.hpiModifyingFactors || ''}
                  onChange={(e) => updateForm({ hpiModifyingFactors: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">8. Síntomas Asociados</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Náuseas, pirosis, reflujo..."
                  value={formData.hpiAssociatedSymptoms || ''}
                  onChange={(e) => updateForm({ hpiAssociatedSymptoms: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group mt-3">
              <label className="form-sublabel">Relato Cronológico y Narrativa de la Enfermedad Actual</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describa el relato cronológico detallado de la queja actual del paciente..."
                value={formData.hpiNarrative || ''}
                onChange={(e) => updateForm({ hpiNarrative: e.target.value })}
              ></textarea>
            </div>
          </div>
        )}
      </div>

      {/* 4. SECCION: REVISION POR SISTEMAS (ROS) */}
      <div className="clinical-card">
        <div className="card-header">
          <div className="header-actions-row">
            <div>
              <h2 className="card-title">Revisión por Sistemas (ROS)</h2>
              <p className="card-description">Interrogatorio dirigido por aparatos y sistemas para detectar comorbilidades</p>
            </div>
            <div className="btn-group-header">
              <button
                type="button"
                className="btn-outline-primary"
                onClick={handleMarkAllRosNormal}
              >
                Marcar Todos Normales (Negativo Estándar / (-))
              </button>
            </div>
          </div>
        </div>

        <div className="ros-controls-bar">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.reviewOfSystems.remainderNegative}
              onChange={(e) => {
                updateForm({
                  reviewOfSystems: {
                    ...formData.reviewOfSystems,
                    remainderNegative: e.target.checked
                  }
                });
              }}
            />
            Resto de sistemas interrogados y negativos (-)
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.reviewOfSystems.unableToObtain}
              onChange={(e) => {
                updateForm({
                  reviewOfSystems: {
                    ...formData.reviewOfSystems,
                    unableToObtain: e.target.checked
                  }
                });
              }}
            />
            No fue posible interrogar revisión por sistemas
          </label>
        </div>

        {!formData.reviewOfSystems.unableToObtain && (
          <div className="ros-table-container">
            <table className="ros-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Sistema / Aparato</th>
                  <th style={{ width: '14%', textAlign: 'center' }}>Estado</th>
                  <th style={{ width: '58%' }}>Comentarios / Síntomas Pertinentes</th>
                </tr>
              </thead>
              <tbody>
                {ROS_SYSTEMS_CONFIG.map((sys) => {
                  const currentSys = (formData.reviewOfSystems as any)[sys.key] || { normal: true, comments: '' };
                  const isNormal = currentSys.normal !== false;

                  return (
                    <tr key={sys.key} className={isNormal ? 'row-normal' : 'row-abnormal'}>
                      <td>
                        <div className="sys-name">{sys.label}</div>
                        <div className="sys-examples">{sys.examples}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="status-toggle-pill">
                          <button
                            type="button"
                            className={`toggle-btn ${isNormal ? 'active-normal' : ''}`}
                            onClick={() => handleRosChange(sys.key, 'normal', true)}
                          >
                            Normal (-)
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn ${!isNormal ? 'active-abnormal' : ''}`}
                            onClick={() => handleRosChange(sys.key, 'normal', false)}
                          >
                            Anormal (+)
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input compact-input"
                          placeholder={isNormal ? 'Sin hallazgos referidos' : 'Describa el síntoma anormal...'}
                          value={currentSys.comments || ''}
                          onChange={(e) => handleRosChange(sys.key, 'comments', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. SECCION: ANTECEDENTES CLINICOS FUSIONADOS */}
      <div className="clinical-card">
        <div className="card-header">
          <h2 className="card-title">Antecedentes Clínicos</h2>
          <p className="card-description">Integración de antecedentes médicos, quirúrgicos, ginecológicos, hábitos y familiares</p>
        </div>

        {/* 5.1 ANTECEDENTES PATOLOGICOS FIJOS Y OTROS */}
        <div className="sub-panel mb-4">
          <div className="panel-title-row">
            <h3 className="panel-title">Patológicos Fijos de Control Clínico</h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Marque (+) si está presente o (-) si es negativo
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
            {FIXED_PATHOLOGY_ITEMS.map((item) => {
              const currentVal = !!(formData.pastMedicalSurgical?.fixedPathologies as any)?.[item.key];
              return (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: currentVal ? 'rgba(239, 68, 68, 0.08)' : '#f8fafc', border: `1px solid ${currentVal ? '#ef4444' : '#e2e8f0'}`, borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: currentVal ? '#991b1b' : '#334155' }}>
                    {item.label}
                  </span>
                  <div className="status-toggle-pill" style={{ margin: 0 }}>
                    <button
                      type="button"
                      className={`toggle-btn ${!currentVal ? 'active-normal' : ''}`}
                      onClick={() => handleFixedPathologyToggle(item.key, false)}
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      No (-)
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${currentVal ? 'active-abnormal' : ''}`}
                      onClick={() => handleFixedPathologyToggle(item.key, true)}
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      Sí (+)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3">
            <Select2Search
              category="antecedente"
              label="Otros Antecedentes Patológicos (ej. Covid, Gastritis, etc.)"
              placeholder="Buscar o ingresar otros antecedentes..."
              isMulti={true}
              values={formData.pastMedicalSurgical?.conditions || []}
              onChangeMulti={(vals) => {
                updateForm({
                  pastMedicalSurgical: {
                    ...formData.pastMedicalSurgical,
                    conditions: vals
                  }
                });
              }}
            />
          </div>
        </div>

        {/* 5.2 QUIRURGICOS, TOXICOS, TRAUMATICOS, HOSPITALARIOS, TRANSFUSIONALES, FARMACOLOGICOS */}
        <div className="form-grid-3 mb-4">
          <div className="sub-panel">
            <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>Quirúrgicos</h4>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. (+) Pterigio derecho, Colecistectomía..."
              value={formData.pastMedicalSurgical?.surgicalHistory || ''}
              onChange={(e) => {
                updateForm({
                  pastMedicalSurgical: {
                    ...formData.pastMedicalSurgical,
                    surgicalHistory: e.target.value
                  }
                });
              }}
            />
          </div>

          <div className="sub-panel">
            <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>Tóxicos</h4>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. (+) por hígado, exposición a solventes..."
              value={formData.pastMedicalSurgical?.toxicHistory || ''}
              onChange={(e) => {
                updateForm({
                  pastMedicalSurgical: {
                    ...formData.pastMedicalSurgical,
                    toxicHistory: e.target.value
                  }
                });
              }}
            />
          </div>

          <div className="sub-panel">
            <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>Traumáticos</h4>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. (-) No refiere, o Fractura de fémur (2015)..."
              value={formData.pastMedicalSurgical?.traumaticHistory || ''}
              onChange={(e) => {
                updateForm({
                  pastMedicalSurgical: {
                    ...formData.pastMedicalSurgical,
                    traumaticHistory: e.target.value
                  }
                });
              }}
            />
          </div>

          <div className="sub-panel">
            <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>Hospitalarios</h4>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. (-) o Hospitalización por neumonía en 2021..."
              value={formData.pastMedicalSurgical?.hospitalHistory || ''}
              onChange={(e) => {
                updateForm({
                  pastMedicalSurgical: {
                    ...formData.pastMedicalSurgical,
                    hospitalHistory: e.target.value
                  }
                });
              }}
            />
          </div>

          <div className="sub-panel">
            <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>Transfusionales y Rh</h4>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                className="form-input"
                style={{ width: '45%' }}
                value={formData.pastMedicalSurgical?.transfusionHistory?.bloodType || 'No determinado'}
                onChange={(e) => {
                  const currentTh = formData.pastMedicalSurgical?.transfusionHistory || { hasTransfusions: false, bloodType: 'No determinado' };
                  updateForm({
                    pastMedicalSurgical: {
                      ...formData.pastMedicalSurgical,
                      transfusionHistory: { ...currentTh, bloodType: e.target.value }
                    }
                  });
                }}
              >
                {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>

              <label className="checkbox-label" style={{ fontSize: '0.8rem' }}>
                <input
                  type="checkbox"
                  checked={!!formData.pastMedicalSurgical?.transfusionHistory?.hasTransfusions}
                  onChange={(e) => {
                    const currentTh = formData.pastMedicalSurgical?.transfusionHistory || { hasTransfusions: false, bloodType: 'No determinado' };
                    updateForm({
                      pastMedicalSurgical: {
                        ...formData.pastMedicalSurgical,
                        transfusionHistory: { ...currentTh, hasTransfusions: e.target.checked }
                      }
                    });
                  }}
                />
                Transfusiones (+)
              </label>
            </div>
          </div>

          <div className="sub-panel">
            <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>Farmacológicos Previos</h4>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. (-) Ninguno, o Enalapril 10mg..."
              value={formData.pastMedicalSurgical?.pharmacologicalHistory || ''}
              onChange={(e) => {
                updateForm({
                  pastMedicalSurgical: {
                    ...formData.pastMedicalSurgical,
                    pharmacologicalHistory: e.target.value
                  }
                });
              }}
            />
          </div>
        </div>

        {/* 5.3 ANTECEDENTES GINECOLOGICOS (CONDICIONAL MUJERES / TOGGLE MANUAL) */}
        <div className="sub-panel mb-4">
          <div className="panel-title-row">
            <h3 className="panel-title">Antecedentes Gineco-Obstétricos</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label className="checkbox-label" style={{ fontSize: '0.82rem' }}>
                <input
                  type="checkbox"
                  checked={showGynecology}
                  onChange={(e) => {
                    setManualGynecoToggle(e.target.checked);
                    updateForm({
                      gynecologicalHistory: {
                        ...(formData.gynecologicalHistory || {
                          gravidity: '',
                          parity: '',
                          abortions: '',
                          livingChildren: '',
                          lastMenstrualPeriod: '',
                          cycleType: 'R',
                          cycleDuration: '28',
                          isFamilyPlanning: false,
                          familyPlanningMethod: ''
                        }),
                        applicable: e.target.checked
                      }
                    });
                  }}
                />
                {isFemale ? 'Aplica antecedentes ginecológicos' : 'Forzar despliegue de antecedentes ginecológicos'}
              </label>
            </div>
          </div>

          {showGynecology ? (
            <div className="animate-slide-down mt-2">
              <div className="form-grid-4">
                <div className="form-group">
                  <label className="form-sublabel">G (Gestaciones)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="G"
                    value={formData.gynecologicalHistory?.gravidity ?? ''}
                    onChange={(e) => {
                      updateForm({
                        gynecologicalHistory: {
                          ...formData.gynecologicalHistory,
                          applicable: true,
                          gravidity: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                          parity: formData.gynecologicalHistory?.parity ?? '',
                          abortions: formData.gynecologicalHistory?.abortions ?? '',
                          livingChildren: formData.gynecologicalHistory?.livingChildren ?? '',
                          lastMenstrualPeriod: formData.gynecologicalHistory?.lastMenstrualPeriod ?? '',
                          cycleType: formData.gynecologicalHistory?.cycleType ?? 'R',
                          cycleDuration: formData.gynecologicalHistory?.cycleDuration ?? '',
                          isFamilyPlanning: formData.gynecologicalHistory?.isFamilyPlanning ?? false,
                          familyPlanningMethod: formData.gynecologicalHistory?.familyPlanningMethod ?? ''
                        }
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-sublabel">P (Partos)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="P"
                    value={formData.gynecologicalHistory?.parity ?? ''}
                    onChange={(e) => {
                      updateForm({
                        gynecologicalHistory: {
                          ...formData.gynecologicalHistory,
                          applicable: true,
                          gravidity: formData.gynecologicalHistory?.gravidity ?? '',
                          parity: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                          abortions: formData.gynecologicalHistory?.abortions ?? '',
                          livingChildren: formData.gynecologicalHistory?.livingChildren ?? '',
                          lastMenstrualPeriod: formData.gynecologicalHistory?.lastMenstrualPeriod ?? '',
                          cycleType: formData.gynecologicalHistory?.cycleType ?? 'R',
                          cycleDuration: formData.gynecologicalHistory?.cycleDuration ?? '',
                          isFamilyPlanning: formData.gynecologicalHistory?.isFamilyPlanning ?? false,
                          familyPlanningMethod: formData.gynecologicalHistory?.familyPlanningMethod ?? ''
                        }
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-sublabel">A (Abortos)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="A"
                    value={formData.gynecologicalHistory?.abortions ?? ''}
                    onChange={(e) => {
                      updateForm({
                        gynecologicalHistory: {
                          ...formData.gynecologicalHistory,
                          applicable: true,
                          gravidity: formData.gynecologicalHistory?.gravidity ?? '',
                          parity: formData.gynecologicalHistory?.parity ?? '',
                          abortions: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                          livingChildren: formData.gynecologicalHistory?.livingChildren ?? '',
                          lastMenstrualPeriod: formData.gynecologicalHistory?.lastMenstrualPeriod ?? '',
                          cycleType: formData.gynecologicalHistory?.cycleType ?? 'R',
                          cycleDuration: formData.gynecologicalHistory?.cycleDuration ?? '',
                          isFamilyPlanning: formData.gynecologicalHistory?.isFamilyPlanning ?? false,
                          familyPlanningMethod: formData.gynecologicalHistory?.familyPlanningMethod ?? ''
                        }
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-sublabel">V (Hijos Vivos)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="V"
                    value={formData.gynecologicalHistory?.livingChildren ?? ''}
                    onChange={(e) => {
                      updateForm({
                        gynecologicalHistory: {
                          ...formData.gynecologicalHistory,
                          applicable: true,
                          gravidity: formData.gynecologicalHistory?.gravidity ?? '',
                          parity: formData.gynecologicalHistory?.parity ?? '',
                          abortions: formData.gynecologicalHistory?.abortions ?? '',
                          livingChildren: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                          lastMenstrualPeriod: formData.gynecologicalHistory?.lastMenstrualPeriod ?? '',
                          cycleType: formData.gynecologicalHistory?.cycleType ?? 'R',
                          cycleDuration: formData.gynecologicalHistory?.cycleDuration ?? '',
                          isFamilyPlanning: formData.gynecologicalHistory?.isFamilyPlanning ?? false,
                          familyPlanningMethod: formData.gynecologicalHistory?.familyPlanningMethod ?? ''
                        }
                      });
                    }}
                  />
                </div>
              </div>

              <div className="form-grid-3 mt-3">
                <div className="form-group">
                  <label className="form-sublabel">Fecha de Última Regla (FUR)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.gynecologicalHistory?.lastMenstrualPeriod || ''}
                    onChange={(e) => {
                      updateForm({
                        gynecologicalHistory: {
                          ...(formData.gynecologicalHistory || {
                            applicable: true,
                            gravidity: '',
                            parity: '',
                            abortions: '',
                            livingChildren: '',
                            cycleType: 'R',
                            cycleDuration: '28',
                            isFamilyPlanning: false,
                            familyPlanningMethod: ''
                          }),
                          lastMenstrualPeriod: e.target.value
                        }
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-sublabel">Ciclos (Regular / Irregular y duración)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      className="form-input"
                      style={{ width: '50%' }}
                      value={formData.gynecologicalHistory?.cycleType || 'R'}
                      onChange={(e) => {
                        updateForm({
                          gynecologicalHistory: {
                            ...(formData.gynecologicalHistory || {
                              applicable: true,
                              gravidity: '',
                              parity: '',
                              abortions: '',
                              livingChildren: '',
                              lastMenstrualPeriod: '',
                              cycleDuration: '28',
                              isFamilyPlanning: false,
                              familyPlanningMethod: ''
                            }),
                            cycleType: e.target.value as any
                          }
                        });
                      }}
                    >
                      <option value="R">R (Regular)</option>
                      <option value="I">I (Irregular)</option>
                    </select>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '50%' }}
                      placeholder="Días (ej. 28)"
                      value={formData.gynecologicalHistory?.cycleDuration || ''}
                      onChange={(e) => {
                        updateForm({
                          gynecologicalHistory: {
                            ...(formData.gynecologicalHistory || {
                              applicable: true,
                              gravidity: '',
                              parity: '',
                              abortions: '',
                              livingChildren: '',
                              lastMenstrualPeriod: '',
                              cycleType: 'R',
                              isFamilyPlanning: false,
                              familyPlanningMethod: ''
                            }),
                            cycleDuration: e.target.value
                          }
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-sublabel">¿Está planificando?</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label className="checkbox-label" style={{ whiteSpace: 'nowrap' }}>
                      <input
                        type="checkbox"
                        checked={!!formData.gynecologicalHistory?.isFamilyPlanning}
                        onChange={(e) => {
                          updateForm({
                            gynecologicalHistory: {
                              ...(formData.gynecologicalHistory || {
                                applicable: true,
                                gravidity: '',
                                parity: '',
                                abortions: '',
                                livingChildren: '',
                                lastMenstrualPeriod: '',
                                cycleType: 'R',
                                cycleDuration: '28',
                                familyPlanningMethod: ''
                              }),
                              isFamilyPlanning: e.target.checked
                            }
                          });
                        }}
                      />
                      Sí planifica
                    </label>
                    {formData.gynecologicalHistory?.isFamilyPlanning && (
                      <input
                        type="text"
                        className="form-input"
                        placeholder="¿Con qué método? (ej. DIU Mirena, ACO...)"
                        value={formData.gynecologicalHistory?.familyPlanningMethod || ''}
                        onChange={(e) => {
                          updateForm({
                            gynecologicalHistory: {
                              ...formData.gynecologicalHistory!,
                              familyPlanningMethod: e.target.value
                            }
                          });
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.5rem 0 0 0' }}>
              No aplica (Paciente masculino o sección desactivada). Active la casilla superior para registrar antecedentes gineco-obstétricos.
            </p>
          )}
        </div>

        {/* 5.4 HABITOS (TABAQUISMO, ALCOHOL, SUSTANCIAS, PAREJAS SEXUALES) */}
        <div className="sub-panel mb-4">
          <div className="panel-title-row">
            <h3 className="panel-title">Hábitos y Factores de Riesgo</h3>
          </div>

          <div className="form-grid-2">
            {/* Tabaquismo */}
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Tabaquismo</span>
                <label className="checkbox-label" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={!!formData.socialHistory?.tobacco?.uses}
                    onChange={(e) => {
                      const curT = formData.socialHistory?.tobacco || { uses: false, frequency: '', productType: '', packYears: '' };
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          tobacco: { ...curT, uses: e.target.checked }
                        }
                      });
                    }}
                  />
                  Fumador (+)
                </label>
              </div>

              {formData.socialHistory?.tobacco?.uses ? (
                <div className="form-grid-3 animate-slide-down">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="¿Qué fuma? (cigarrillo, vape...)"
                    value={formData.socialHistory?.tobacco?.productType || ''}
                    onChange={(e) => {
                      const curT = formData.socialHistory?.tobacco || { uses: true, frequency: '', productType: '', packYears: '' };
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          tobacco: { ...curT, productType: e.target.value }
                        }
                      });
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Frecuencia (ej. 10/día)"
                    value={formData.socialHistory?.tobacco?.frequency || ''}
                    onChange={(e) => {
                      const curT = formData.socialHistory?.tobacco || { uses: true, frequency: '', productType: '', packYears: '' };
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          tobacco: { ...curT, frequency: e.target.value }
                        }
                      });
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Índice paq/año"
                    value={formData.socialHistory?.tobacco?.packYears || ''}
                    onChange={(e) => {
                      const curT = formData.socialHistory?.tobacco || { uses: true, frequency: '', productType: '', packYears: '' };
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          tobacco: { ...curT, packYears: e.target.value }
                        }
                      });
                    }}
                  />
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No fumador (-)</span>
              )}
            </div>

            {/* Alcohol */}
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Consumo de Alcohol</span>
                <label className="checkbox-label" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={!!formData.socialHistory?.alcohol?.uses}
                    onChange={(e) => {
                      const curA = formData.socialHistory?.alcohol || { uses: false, frequency: '', beverageType: '' };
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          alcohol: { ...curA, uses: e.target.checked }
                        }
                      });
                    }}
                  />
                  Bebedor (+)
                </label>
              </div>

              {formData.socialHistory?.alcohol?.uses ? (
                <div className="form-grid-2 animate-slide-down">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Frecuencia (ej. cada 8 días)"
                    value={formData.socialHistory?.alcohol?.frequency || ''}
                    onChange={(e) => {
                      const curA = formData.socialHistory?.alcohol || { uses: true, frequency: '', beverageType: '' };
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          alcohol: { ...curA, frequency: e.target.value }
                        }
                      });
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Tipo de licor (ej. whisky, cerveza)"
                    value={formData.socialHistory?.alcohol?.beverageType || ''}
                    onChange={(e) => {
                      const curA = formData.socialHistory?.alcohol || { uses: true, frequency: '', beverageType: '' };
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          alcohol: { ...curA, beverageType: e.target.value }
                        }
                      });
                    }}
                  />
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No bebedor (-)</span>
              )}
            </div>

            {/* Sustancias Psicoactivas */}
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sustancias Psicoactivas</span>
                <label className="checkbox-label" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={!!formData.socialHistory?.psychoactive?.uses}
                    onChange={(e) => {
                      const curP = formData.socialHistory?.psychoactive || { uses: false, substance: '', frequency: '' };
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          psychoactive: { ...curP, uses: e.target.checked }
                        }
                      });
                    }}
                  />
                  Consumo (+)
                </label>
              </div>

              {formData.socialHistory?.psychoactive?.uses ? (
                <div className="form-grid-2 animate-slide-down">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="¿Cuál sustancia?"
                    value={formData.socialHistory?.psychoactive?.substance || ''}
                    onChange={(e) => {
                      const curP = formData.socialHistory?.psychoactive || { uses: true, substance: '', frequency: '' };
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          psychoactive: { ...curP, substance: e.target.value }
                        }
                      });
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Frecuencia de consumo"
                    value={formData.socialHistory?.psychoactive?.frequency || ''}
                    onChange={(e) => {
                      const curP = formData.socialHistory?.psychoactive || { uses: true, substance: '', frequency: '' };
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          psychoactive: { ...curP, frequency: e.target.value }
                        }
                      });
                    }}
                  />
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No consumidor (-)</span>
              )}
            </div>

            {/* Número de Parejas Sexuales */}
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                Número de Parejas Sexuales
              </span>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. 1 pareja estable, o número..."
                value={formData.socialHistory?.sexualPartnersCount || ''}
                onChange={(e) => {
                  updateForm({
                    socialHistory: {
                      ...formData.socialHistory,
                      sexualPartnersCount: e.target.value
                    }
                  });
                }}
              />
            </div>
          </div>
        </div>

        {/* 5.5 ANTECEDENTES FAMILIARES (PADRES, HERMANOS, ABUELOS CON CASILLAS Y DETALLE) */}
        <div className="sub-panel">
          <div className="panel-title-row">
            <h3 className="panel-title">Antecedentes Familiares Hereditarios</h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Enfermedades de relevancia genética en 1er y 2do grado
            </span>
          </div>

          <div className="form-grid-3 mt-2">
            {/* Padres */}
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.5rem' }}>Padres</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.5rem' }}>
                {COMMON_HEREDITARY_DISEASES.map(dis => {
                  const currentList = formData.familyHistory?.parents?.diseases || [];
                  const isChecked = currentList.includes(dis);
                  return (
                    <label key={dis} className="checkbox-label" style={{ fontSize: '0.8rem' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...currentList, dis]
                            : currentList.filter(d => d !== dis);
                          updateForm({
                            familyHistory: {
                              ...formData.familyHistory,
                              parents: {
                                ...(formData.familyHistory?.parents || { details: '' }),
                                diseases: updated
                              }
                            }
                          });
                        }}
                      />
                      {dis}
                    </label>
                  );
                })}
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="Detalle (ej. Madre DMNID e HTA)..."
                value={formData.familyHistory?.parents?.details || ''}
                onChange={(e) => {
                  updateForm({
                    familyHistory: {
                      ...formData.familyHistory,
                      parents: {
                        ...(formData.familyHistory?.parents || { diseases: [] }),
                        details: e.target.value
                      }
                    }
                  });
                }}
              />
            </div>

            {/* Hermanos */}
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.5rem' }}>Hermanos</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.5rem' }}>
                {COMMON_HEREDITARY_DISEASES.map(dis => {
                  const currentList = formData.familyHistory?.siblings?.diseases || [];
                  const isChecked = currentList.includes(dis);
                  return (
                    <label key={dis} className="checkbox-label" style={{ fontSize: '0.8rem' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...currentList, dis]
                            : currentList.filter(d => d !== dis);
                          updateForm({
                            familyHistory: {
                              ...formData.familyHistory,
                              siblings: {
                                ...(formData.familyHistory?.siblings || { details: '' }),
                                diseases: updated
                              }
                            }
                          });
                        }}
                      />
                      {dis}
                    </label>
                  );
                })}
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="Detalle (ej. Hermano con Asma)..."
                value={formData.familyHistory?.siblings?.details || ''}
                onChange={(e) => {
                  updateForm({
                    familyHistory: {
                      ...formData.familyHistory,
                      siblings: {
                        ...(formData.familyHistory?.siblings || { diseases: [] }),
                        details: e.target.value
                      }
                    }
                  });
                }}
              />
            </div>

            {/* Abuelos */}
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.5rem' }}>Abuelos</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.5rem' }}>
                {COMMON_HEREDITARY_DISEASES.map(dis => {
                  const currentList = formData.familyHistory?.grandparents?.diseases || [];
                  const isChecked = currentList.includes(dis);
                  return (
                    <label key={dis} className="checkbox-label" style={{ fontSize: '0.8rem' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...currentList, dis]
                            : currentList.filter(d => d !== dis);
                          updateForm({
                            familyHistory: {
                              ...formData.familyHistory,
                              grandparents: {
                                ...(formData.familyHistory?.grandparents || { details: '' }),
                                diseases: updated
                              }
                            }
                          });
                        }}
                      />
                      {dis}
                    </label>
                  );
                })}
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="Detalle (ej. Abuelo paterno con IAM)..."
                value={formData.familyHistory?.grandparents?.details || ''}
                onChange={(e) => {
                  updateForm({
                    familyHistory: {
                      ...formData.familyHistory,
                      grandparents: {
                        ...(formData.familyHistory?.grandparents || { diseases: [] }),
                        details: e.target.value
                      }
                    }
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE NAVEGACION INFERIOR */}
      <div className="step-actions-footer">
        <div className="action-hint">
          {!formData.patientName && <span className="warning-text">* Complete el nombre del paciente para continuar</span>}
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={onNext}
          disabled={!formData.patientName || !formData.date || !formData.time}
        >
          Continuar a Etapa 2: Examen Físico →
        </button>
      </div>
    </div>
  );
};
