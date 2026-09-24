import React from 'react';
import { InpatientConsultation, ReviewOfSystems } from '../types/consultation.js';
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

export const Step1GeneralHistory: React.FC<Step1Props> = ({
  formData,
  updateForm,
  onNext
}) => {
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

  return (
    <div className="step-container animate-fade-in">
      {/* 1. SECCION: IDENTIFICACION Y DATOS DE LA VISITA */}
      <div className="clinical-card">
        <div className="card-header">
          <div className="card-badge">Documento Base: Pagina 1</div>
          <h2 className="card-title">Datos Generales e Identificación de la Consulta</h2>
          <p className="card-description">Registro de la orden médica, tipo de asistencia e identificación del paciente</p>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label required">Nombre Completo del Paciente</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Juan Carlos Perez Gomez"
              value={formData.patientName}
              onChange={(e) => updateForm({ patientName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">N° de Historia Clínica / Cédula</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. HC-84920412"
              value={formData.patientIdNumber || ''}
              onChange={(e) => updateForm({ patientIdNumber: e.target.value })}
            />
          </div>

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
                Visita Hospitalaria Inicial
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
        </div>

        <div className="form-grid-3 mt-4">
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

          {formData.visitType === 'consult' && (
            <div className="form-group animate-slide-down">
              <label className="form-label required">Médico o Servicio Solicitante</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Dr. Ramirez - Servicio de Cirugia General"
                value={formData.requestingPhysician || ''}
                onChange={(e) => updateForm({ requestingPhysician: e.target.value })}
              />
            </div>
          )}
        </div>
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
                Sin alergias conocidas (NKDA)
              </label>
            </div>

            <Select2Search
              category="alergia"
              label="Buscar Alergias en Catálogo"
              placeholder="Escriba medicamento o sustancia alergénica..."
              isMulti={true}
              values={formData.allergiesList}
              onChangeMulti={(vals) => {
                updateForm({
                  allergiesList: vals,
                  nkda: vals.length > 0 ? false : formData.nkda
                });
              }}
              disabled={formData.nkda}
              helperText="Seleccione de la lista o presione Enter para registrar un término libre."
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
                  Suplementos / Hierbas
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
                He considerado la lista de medicación domiciliaria al redactar las órdenes médicas.
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECCION: MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL (HPI) */}
      <div className="clinical-card">
        <div className="card-header">
          <div className="card-badge">Dimensiones HPI</div>
          <h2 className="card-title">Motivo de Consulta y Enfermedad Actual (HPI)</h2>
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
              placeholder="Buscar motivo frecuente o ingresar síntoma guía..."
              isMulti={false}
              value={formData.chiefComplaint}
              onChangeSingle={(val) => updateForm({ chiefComplaint: val })}
            />
          ) : (
            <input
              type="text"
              className="form-input warning-input"
              placeholder="Indicar motivo (ej. Paciente intubado, estuporoso, sin acudiente disponible)..."
              value={formData.hpiUnableReason || ''}
              onChange={(e) => updateForm({ hpiUnableReason: e.target.value })}
            />
          )}
        </div>

        {/* Dimensiones clínicas del HPI (8 elementos según estándar de consulta médica) */}
        {!formData.hpiUnableToObtain && (
          <div className="dimensions-box">
            <h4 className="dimensions-title">Caracterización Estructurada del Síntoma:</h4>
            <div className="form-grid-4">
              <div className="form-group">
                <label className="form-sublabel">1. Localización / Irradiación</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Retroesternal irradiado a mandíbula"
                  value={formData.hpiLocation || ''}
                  onChange={(e) => updateForm({ hpiLocation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">2. Calidad / Carácter</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Opresivo, punzante, urente, cólico"
                  value={formData.hpiQuality || ''}
                  onChange={(e) => updateForm({ hpiQuality: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">3. Duración</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. 3 horas de evolución sostenida"
                  value={formData.hpiDuration || ''}
                  onChange={(e) => updateForm({ hpiDuration: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">4. Temporalidad / Inicio</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Inicio súbito, matutino, recurrente"
                  value={formData.hpiTiming || ''}
                  onChange={(e) => updateForm({ hpiTiming: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">5. Severidad / Intensidad</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. 8/10 en escala visual análoga"
                  value={formData.hpiSeverity || ''}
                  onChange={(e) => updateForm({ hpiSeverity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">6. Contexto de Presentación</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Durante esfuerzo físico moderado"
                  value={formData.hpiContext || ''}
                  onChange={(e) => updateForm({ hpiContext: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">7. Factores Modificadores</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. No cede con reposo ni nitratos"
                  value={formData.hpiModifyingFactors || ''}
                  onChange={(e) => updateForm({ hpiModifyingFactors: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">8. Síntomas Asociados</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Diaforesis profusa, náuseas, disnea"
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
                placeholder="Describa la cronología de eventos, atención previa en urgencias y evolución del cuadro clínico..."
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
                Marcar Todos Normales (Negativo Estándar)
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
            Resto de sistemas interrogados y negativos
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
                  <th style={{ width: '12%', textAlign: 'center' }}>Estado</th>
                  <th style={{ width: '60%' }}>Comentarios / Síntomas Positivos o Negativos Pertinentes</th>
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
                            Normal
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn ${!isNormal ? 'active-abnormal' : ''}`}
                            onClick={() => handleRosChange(sys.key, 'normal', false)}
                          >
                            Anormal
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input compact-input"
                          placeholder={isNormal ? 'Sin hallazgos patológicos referidos' : 'Describa el síntoma anormal reportado...'}
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

      {/* 5. SECCION: ANTECEDENTES */}
      <div className="clinical-card">
        <div className="card-header">
          <h2 className="card-title">Antecedentes Médicos, Quirúrgicos, Familiares y Sociales</h2>
          <p className="card-description">Historia previa del paciente y factores de riesgo biosociales</p>
        </div>

        <div className="form-grid-3">
          {/* Antecedentes Médicos y Quirúrgicos */}
          <div className="sub-panel">
            <div className="panel-title-row">
              <h3 className="panel-title">Médicos y Quirúrgicos</h3>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.pastMedicalSurgical.nonContributory}
                  onChange={(e) => {
                    updateForm({
                      pastMedicalSurgical: {
                        ...formData.pastMedicalSurgical,
                        nonContributory: e.target.checked
                      }
                    });
                  }}
                />
                No contributorio
              </label>
            </div>

            <Select2Search
              category="antecedente"
              label="Patologías Previas Conocidas"
              placeholder="Buscar hipertensión, diabetes, etc..."
              isMulti={true}
              values={formData.pastMedicalSurgical.conditions}
              onChangeMulti={(vals) => {
                updateForm({
                  pastMedicalSurgical: {
                    ...formData.pastMedicalSurgical,
                    conditions: vals
                  }
                });
              }}
              disabled={formData.pastMedicalSurgical.nonContributory}
            />

            <div className="form-group mt-3">
              <label className="form-sublabel">Cirugías Previas / Procedimientos</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Apendicectomía (2015), Colecistectomía laparoscópica (2020)"
                value={formData.pastMedicalSurgical.surgicalHistory || ''}
                onChange={(e) => {
                  updateForm({
                    pastMedicalSurgical: {
                      ...formData.pastMedicalSurgical,
                      surgicalHistory: e.target.value
                    }
                  });
                }}
                disabled={formData.pastMedicalSurgical.nonContributory}
              />
            </div>
          </div>

          {/* Antecedentes Familiares */}
          <div className="sub-panel">
            <div className="panel-title-row">
              <h3 className="panel-title">Antecedentes Familiares</h3>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.familyHistory.nonContributory}
                  onChange={(e) => {
                    updateForm({
                      familyHistory: {
                        ...formData.familyHistory,
                        nonContributory: e.target.checked
                      }
                    });
                  }}
                />
                No contributorio
              </label>
            </div>

            <div className="form-group">
              <label className="form-sublabel">Patologías en Familiares de 1er Grado</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Ej. Padre: Infarto agudo de miocardio a los 55 años. Madre: Diabetes mellitus tipo 2..."
                value={formData.familyHistory.details || ''}
                onChange={(e) => {
                  updateForm({
                    familyHistory: {
                      ...formData.familyHistory,
                      details: e.target.value
                    }
                  });
                }}
                disabled={formData.familyHistory.nonContributory}
              ></textarea>
            </div>
          </div>

          {/* Antecedentes Sociales y Hábitos */}
          <div className="sub-panel">
            <div className="panel-title-row">
              <h3 className="panel-title">Sociales y Hábitos</h3>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.socialHistory.nonContributory}
                  onChange={(e) => {
                    updateForm({
                      socialHistory: {
                        ...formData.socialHistory,
                        nonContributory: e.target.checked
                      }
                    });
                  }}
                />
                No contributorio
              </label>
            </div>

            <div className="habits-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.socialHistory.etoh}
                  onChange={(e) => {
                    updateForm({
                      socialHistory: {
                        ...formData.socialHistory,
                        etoh: e.target.checked
                      }
                    });
                  }}
                  disabled={formData.socialHistory.nonContributory}
                />
                Consumo de Alcohol (ETOH)
              </label>

              <div className="habit-inline-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.socialHistory.tobaccoUse}
                    onChange={(e) => {
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          tobaccoUse: e.target.checked
                        }
                      });
                    }}
                    disabled={formData.socialHistory.nonContributory}
                  />
                  Tabaquismo
                </label>
                {formData.socialHistory.tobaccoUse && (
                  <input
                    type="text"
                    className="form-input mini-input"
                    placeholder="paq/año"
                    value={formData.socialHistory.tobaccoPackYears || ''}
                    onChange={(e) => {
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          tobaccoPackYears: e.target.value
                        }
                      });
                    }}
                  />
                )}
              </div>

              <div className="habit-inline-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.socialHistory.ivda}
                    onChange={(e) => {
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          ivda: e.target.checked
                        }
                      });
                    }}
                    disabled={formData.socialHistory.nonContributory}
                  />
                  Drogas Parenterales (IVDA)
                </label>
                {formData.socialHistory.ivda && (
                  <input
                    type="text"
                    className="form-input mini-input"
                    placeholder="Último consumo"
                    value={formData.socialHistory.ivdaLastUse || ''}
                    onChange={(e) => {
                      updateForm({
                        socialHistory: {
                          ...formData.socialHistory,
                          ivdaLastUse: e.target.value
                        }
                      });
                    }}
                  />
                )}
              </div>
            </div>

            <div className="form-group mt-3">
              <label className="form-sublabel">Ocupación</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Docente jubilado, Ingeniero civil..."
                value={formData.socialHistory.occupation || ''}
                onChange={(e) => {
                  updateForm({
                    socialHistory: {
                      ...formData.socialHistory,
                      occupation: e.target.value
                    }
                  });
                }}
                disabled={formData.socialHistory.nonContributory}
              />
            </div>

            <div className="form-group mt-2">
              <label className="form-sublabel">Situación Habitacional / Red de Apoyo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Vive con cónyuge, vivienda urbana con todos los servicios..."
                value={formData.socialHistory.livingSituation || ''}
                onChange={(e) => {
                  updateForm({
                    socialHistory: {
                      ...formData.socialHistory,
                      livingSituation: e.target.value
                    }
                  });
                }}
                disabled={formData.socialHistory.nonContributory}
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
