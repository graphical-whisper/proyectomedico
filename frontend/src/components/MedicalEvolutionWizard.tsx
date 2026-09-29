import React, { useState } from 'react';
import { MedicalEvolution, RequestedExam } from '../types/consultation.js';
import { Select2Search } from './Select2Search.js';
import { WizardProgress } from './WizardProgress.js';

interface MedicalEvolutionWizardProps {
  formData: MedicalEvolution;
  updateForm: (fields: Partial<MedicalEvolution>) => void;
  onSave: () => Promise<void>;
  onOpenPrintPreview: () => void;
  onCopyClipboard: () => void;
  isSaving: boolean;
  saveStatus: { success?: boolean; message?: string } | null;
}

export const MedicalEvolutionWizard: React.FC<MedicalEvolutionWizardProps> = ({
  formData,
  updateForm,
  onSave,
  onOpenPrintPreview,
  onCopyClipboard,
  isSaving,
  saveStatus
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [newDx, setNewDx] = useState<string>('');
  const [newRx, setNewRx] = useState<{ drug: string; dose: string; instructions: string }>({ drug: '', dose: '', instructions: '' });
  const [newLabEntry, setNewLabEntry] = useState<{ testName: string; testCode?: string; result: string; unit?: string; reference?: string }>({
    testName: '',
    testCode: '',
    result: '',
    unit: '',
    reference: ''
  });
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Cálculo de IMC automático
  const weightNum = parseFloat(formData.objective?.vitals?.weight || '0');
  const heightNum = parseFloat(formData.objective?.vitals?.height || '0');
  let imcText = '';
  let imcCategory = '';
  if (weightNum > 0 && heightNum > 0) {
    const imc = weightNum / (heightNum * heightNum);
    imcText = imc.toFixed(1);
    if (imc < 18.5) imcCategory = 'Bajo peso';
    else if (imc < 25) imcCategory = 'Peso normal';
    else if (imc < 30) imcCategory = 'Sobrepeso';
    else if (imc < 35) imcCategory = 'Obesidad Grado I';
    else if (imc < 40) imcCategory = 'Obesidad Grado II';
    else imcCategory = 'Obesidad Mórbida';
  }

  const handleAddDx = () => {
    if (newDx.trim().length > 0) {
      const current = formData.diagnosticImpressions || [];
      updateForm({ diagnosticImpressions: [...current, newDx.trim()] });
      setNewDx('');
    }
  };

  const handleRemoveDx = (index: number) => {
    const current = formData.diagnosticImpressions || [];
    updateForm({ diagnosticImpressions: current.filter((_, idx) => idx !== index) });
  };

  const handleAddLab = () => {
    if (newLabEntry.testName.trim().length > 0 && newLabEntry.result.trim().length > 0) {
      const current = formData.objective?.laboratoryResults || [];
      updateForm({
        objective: {
          ...formData.objective,
          laboratoryResults: [...current, { ...newLabEntry }]
        }
      });
      setNewLabEntry({ testName: '', testCode: '', result: '', unit: '', reference: '' });
    }
  };

  const handleRemoveLab = (index: number) => {
    const current = formData.objective?.laboratoryResults || [];
    updateForm({
      objective: {
        ...formData.objective,
        laboratoryResults: current.filter((_, idx) => idx !== index)
      }
    });
  };

  const handleAddPrescription = () => {
    if (newRx.drug.trim().length > 0) {
      const current = formData.plan?.prescriptions || [];
      updateForm({
        plan: {
          ...formData.plan,
          prescriptions: [...current, { ...newRx }]
        }
      });
      setNewRx({ drug: '', dose: '', instructions: '' });
    }
  };

  const handleRemovePrescription = (index: number) => {
    const current = formData.plan?.prescriptions || [];
    updateForm({
      plan: {
        ...formData.plan,
        prescriptions: current.filter((_, idx) => idx !== index)
      }
    });
  };

  const handleCopy = () => {
    onCopyClipboard();
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  return (
    <div className="step-container animate-fade-in">
      <WizardProgress
        currentStep={currentStep}
        totalSteps={3}
        onSelectStep={(step) => setCurrentStep(step)}
      />

      {/* ETAPA 1: IDENTIFICACION E IMPRESION DIAGNOSTICA */}
      {currentStep === 1 && (
        <div className="clinical-card">
          <div className="card-header">
            <div className="card-badge">Evolución Médica (Control Clínico)</div>
            <h2 className="card-title">Etapa 1: Datos de Atención e Impresión Diagnóstica</h2>
            <p className="card-description">Filiación del paciente e impresión diagnóstica jerarquizada (1, 2, 3...)</p>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label required">Nombre del Paciente</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Martha Liliana Gómez"
                value={formData.patientName}
                onChange={(e) => updateForm({ patientName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Identificación / Cédula</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. 63321456"
                value={formData.patientIdNumber || ''}
                onChange={(e) => updateForm({ patientIdNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Entidad / Aseguradora</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Particular, Colsanitas..."
                value={formData.entity || ''}
                onChange={(e) => updateForm({ entity: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-4 mt-3">
            <div className="form-group">
              <label className="form-label">Edad</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. 53 años"
                value={formData.age || ''}
                onChange={(e) => updateForm({ age: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sexo Biológico</label>
              <div className="radio-group-container">
                <label className={`radio-pill ${formData.biologicalSex === 'M' ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="evoSex"
                    value="M"
                    checked={formData.biologicalSex === 'M'}
                    onChange={() => updateForm({ biologicalSex: 'M' })}
                  />
                  M
                </label>
                <label className={`radio-pill ${formData.biologicalSex === 'F' ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="evoSex"
                    value="F"
                    checked={formData.biologicalSex === 'F'}
                    onChange={() => updateForm({ biologicalSex: 'F' })}
                  />
                  F
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Fecha de Evolución</label>
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

          {/* IMPRESION DIAGNOSTICA JERARQUIZADA */}
          <div className="sub-panel mt-4">
            <div className="panel-title-row">
              <h3 className="panel-title">Impresión Diagnóstica Priorizada</h3>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Conforme al formato de evolución médica del Dr. Oscar Rueda (1-, 2-, 3-...)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <Select2Search
                  category="diagnostico"
                  placeholder="Buscar en catálogo CIE-10 o escribir diagnóstico..."
                  isMulti={false}
                  value={newDx}
                  onChangeSingle={(val) => setNewDx(val)}
                />
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddDx}
                disabled={!newDx.trim()}
                style={{ whiteSpace: 'nowrap' }}
              >
                + Agregar Diagnóstico
              </button>
            </div>

            {formData.diagnosticImpressions && formData.diagnosticImpressions.length > 0 ? (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {formData.diagnosticImpressions.map((dx, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.85rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      <strong style={{ color: '#2563eb', marginRight: '0.5rem' }}>{idx + 1}-</strong> {dx}
                    </span>
                    <button
                      type="button"
                      className="btn-outline-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#ef4444' }}
                      onClick={() => handleRemoveDx(idx)}
                    >
                      ✕ Eliminar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                Sin diagnósticos agregados aún. Seleccione del catálogo o escriba el término para numerar.
              </p>
            )}
          </div>

          <div className="step-actions-footer">
            <div></div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={!formData.patientName}
            >
              Continuar a Etapa 2: Subjetivo y Objetivo (S & O) →
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 2: SUBJETIVO Y OBJETIVO (S & O) */}
      {currentStep === 2 && (
        <div className="clinical-card">
          <div className="card-header">
            <div className="card-badge">Formato SOAP - Componentes S y O</div>
            <h2 className="card-title">Etapa 2: Componente Subjetivo y Objetivo</h2>
            <p className="card-description">Síntomas referidos por el paciente, examen físico enfocado y resultados de paraclínicos</p>
          </div>

          {/* SUBJETIVO (S) */}
          <div className="sub-panel mb-4">
            <h3 className="panel-title mb-2">Subjetivo (S)</h3>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describa la evolución del paciente desde la última visita:
Ejemplo: Mejoría de herpes zóster genital luego de tratamiento con Valaciclovir cada 8h por 1 semana. Trae laboratorios. Sigue con sertralina 50 mg/día y Colmibe 20/10 dos veces al día. Toma media tableta de Alactic cada 15 días..."
              value={formData.subjective}
              onChange={(e) => updateForm({ subjective: e.target.value })}
            ></textarea>
          </div>

          {/* OBJETIVO (O): SIGNOS VITALES */}
          <div className="sub-panel mb-4">
            <div className="panel-title-row">
              <h3 className="panel-title">Objetivo (O) - Signos Vitales y Biometría</h3>
              {imcText && (
                <div style={{ background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  IMC: {imcText} kg/m² ({imcCategory})
                </div>
              )}
            </div>

            <div className="form-grid-4">
              <div className="form-group">
                <label className="form-sublabel">Peso (kg)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. 108.3"
                  value={formData.objective?.vitals?.weight || ''}
                  onChange={(e) => {
                    updateForm({
                      objective: {
                        ...formData.objective,
                        vitals: {
                          ...formData.objective?.vitals,
                          seeFlowSheet: false,
                          weight: e.target.value
                        }
                      }
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">Talla (m)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. 1.73"
                  value={formData.objective?.vitals?.height || ''}
                  onChange={(e) => {
                    updateForm({
                      objective: {
                        ...formData.objective,
                        vitals: {
                          ...formData.objective?.vitals,
                          seeFlowSheet: false,
                          height: e.target.value
                        }
                      }
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">Presión Arterial (mmHg)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. 110/70"
                  value={formData.objective?.vitals?.bloodPressure || ''}
                  onChange={(e) => {
                    updateForm({
                      objective: {
                        ...formData.objective,
                        vitals: {
                          ...formData.objective?.vitals,
                          seeFlowSheet: false,
                          bloodPressure: e.target.value
                        }
                      }
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">Frecuencia Cardíaca (lpm)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. 88"
                  value={formData.objective?.vitals?.pulse || ''}
                  onChange={(e) => {
                    updateForm({
                      objective: {
                        ...formData.objective,
                        vitals: {
                          ...formData.objective?.vitals,
                          seeFlowSheet: false,
                          pulse: e.target.value
                        }
                      }
                    });
                  }}
                />
              </div>
            </div>

            <div className="form-grid-3 mt-3">
              <div className="form-group">
                <label className="form-sublabel">Frecuencia Respiratoria (rpm)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. 16"
                  value={formData.objective?.vitals?.respiratoryRate || ''}
                  onChange={(e) => {
                    updateForm({
                      objective: {
                        ...formData.objective,
                        vitals: {
                          ...formData.objective?.vitals,
                          seeFlowSheet: false,
                          respiratoryRate: e.target.value
                        }
                      }
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-sublabel">Temperatura (°C / Afebril)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Afebril (36.5)"
                  value={formData.objective?.vitals?.temperature || ''}
                  onChange={(e) => {
                    updateForm({
                      objective: {
                        ...formData.objective,
                        vitals: {
                          ...formData.objective?.vitals,
                          seeFlowSheet: false,
                          temperature: e.target.value
                        }
                      }
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* EXAMEN FISICO ENFOCADO NARRATIVO */}
          <div className="sub-panel mb-4">
            <h3 className="panel-title mb-2">Examen Físico Dirigido</h3>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Ejemplo: Normocéfalo, PICNR, Conjuntivas rosadas, OL: normal. Boca: húmeda. Cuello: No IY. RsCsRs sin soplos, ventilación pulmonar normal. Abdomen abundante panículo adiposo, no megalias. Extremidades no edemas, neurológico normal. Lesiones en surco bálano-prepucial sugestivas de herpes simple tipo 2 en remisión..."
              value={formData.objective?.physicalExamNarrative || ''}
              onChange={(e) => {
                updateForm({
                  objective: {
                    ...formData.objective,
                    physicalExamNarrative: e.target.value
                  }
                });
              }}
            ></textarea>
          </div>

          {/* PARACLINICOS Y RESULTADOS DE LABORATORIO CON CATÁLOGO DE 1.578 EXÁMENES */}
          <div className="sub-panel">
            <div className="panel-title-row">
              <h3 className="panel-title">Estudios Paraclínicos y Resultados de Laboratorio Traídos</h3>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Conectado con el portafolio SILAB (1.578 exámenes con código CUPS)
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
              <div className="form-grid-3">
                <div>
                  <label className="form-sublabel">Seleccionar Examen del Portafolio</label>
                  <Select2Search
                    category="examen"
                    placeholder="Buscar examen (ej. TSH, Colesterol, Hemograma)..."
                    isMulti={false}
                    value={newLabEntry.testName}
                    onChangeSingle={(val) => setNewLabEntry({ ...newLabEntry, testName: val })}
                  />
                </div>

                <div>
                  <label className="form-sublabel">Resultado / Valor</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. 1.942 o Normal..."
                    value={newLabEntry.result}
                    onChange={(e) => setNewLabEntry({ ...newLabEntry, result: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-sublabel">Unidad / Rango Referencia (Opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. uIU/mL (0.4 - 4.0)"
                    value={newLabEntry.unit}
                    onChange={(e) => setNewLabEntry({ ...newLabEntry, unit: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-outline-primary"
                  onClick={handleAddLab}
                  disabled={!newLabEntry.testName || !newLabEntry.result}
                >
                  + Agregar Resultado
                </button>
              </div>
            </div>

            {/* Listado de resultados cargados */}
            {formData.objective?.laboratoryResults && formData.objective.laboratoryResults.length > 0 ? (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {formData.objective.laboratoryResults.map((lab, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{lab.testName}</span>: {' '}
                      <span style={{ color: '#0369a1', fontWeight: 700 }}>{lab.result}</span> {lab.unit || ''}
                      {lab.reference ? <span style={{ color: '#64748b', fontSize: '0.8rem' }}> ({lab.reference})</span> : null}
                    </div>
                    <button
                      type="button"
                      className="btn-outline-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#ef4444' }}
                      onClick={() => handleRemoveLab(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                Sin laboratorios estructurados registrados en esta visita.
              </p>
            )}
          </div>

          <div className="step-actions-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              ← Volver a Etapa 1: Diagnósticos
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setCurrentStep(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Continuar a Etapa 3: Análisis y Plan (A & P) →
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3: ANALISIS Y PLAN (A & P) */}
      {currentStep === 3 && (
        <div className="clinical-card">
          <div className="card-header">
            <div className="card-badge">Formato SOAP - Componentes A y P</div>
            <h2 className="card-title">Etapa 3: Análisis Clínico y Plan Terapéutico</h2>
            <p className="card-description">Juicio de medicina interna, conducta, prescripciones farmacológicas y solicitud de exámenes</p>
          </div>

          {/* ANALISIS (A) */}
          <div className="sub-panel mb-4">
            <h3 className="panel-title mb-2">Análisis Clínico (A)</h3>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Describa el juicio clínico y razonamiento del internista:
Ejemplo: Resultados satisfactorios. Debe continuar igual esquema de tratamiento y recomendaciones. Con severo espasmo muscular cervical e interescapular. Se decide inicio de relajante muscular y terapia física. Se solicita Rx de columna cervical AP y lateral. Control con resultados..."
              value={formData.analysis}
              onChange={(e) => updateForm({ analysis: e.target.value })}
            ></textarea>
          </div>

          {/* PLAN (P): CONDUCTA MEDICA GENERAL */}
          <div className="sub-panel mb-4">
            <h3 className="panel-title mb-2">Conducta Médica y Recomendaciones (Cx)</h3>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Ejemplo: Se sugiere valoración por infectología (por herpes zóster Tipo II). Medidas no farmacológicas, pautas de alarma..."
              value={formData.plan?.medicalConduct || ''}
              onChange={(e) => {
                updateForm({
                  plan: {
                    ...formData.plan,
                    medicalConduct: e.target.value
                  }
                });
              }}
            ></textarea>
          </div>

          {/* PLAN (P): FORMULACION Y RECETAS MEDICAS */}
          <div className="sub-panel mb-4">
            <h3 className="panel-title mb-2">Prescripción Farmacológica</h3>
            
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div className="form-grid-3">
                <div>
                  <label className="form-sublabel">Medicamento / Principio Activo</label>
                  <Select2Search
                    category="medicamento"
                    placeholder="Buscar fármaco..."
                    isMulti={false}
                    value={newRx.drug}
                    onChangeSingle={(val) => setNewRx({ ...newRx, drug: val })}
                  />
                </div>
                <div>
                  <label className="form-sublabel">Dosis / Concentración</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Tabletas 125 mg"
                    value={newRx.dose}
                    onChange={(e) => setNewRx({ ...newRx, dose: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-sublabel">Posología e Instrucciones</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Tomar 1 tableta 6 p.m. por 10 días"
                    value={newRx.instructions}
                    onChange={(e) => setNewRx({ ...newRx, instructions: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-outline-primary"
                  onClick={handleAddPrescription}
                  disabled={!newRx.drug.trim()}
                >
                  + Agregar Fármaco a la Receta
                </button>
              </div>
            </div>

            {formData.plan?.prescriptions && formData.plan.prescriptions.length > 0 ? (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {formData.plan.prescriptions.map((rx, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px'
                    }}
                  >
                    <div>
                      <strong style={{ color: '#1e293b' }}>{idx + 1}. {rx.drug}</strong> {rx.dose ? `- ${rx.dose}` : ''}: {' '}
                      <span style={{ color: '#475569' }}>{rx.instructions}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-outline-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#ef4444' }}
                      onClick={() => handleRemovePrescription(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                Sin medicamentos recetados en esta consulta.
              </p>
            )}
          </div>

          {/* PLAN (P): SOLICITUD DE NUEVOS EXAMENES DE LABORATORIO E IMAGENES (SS) */}
          <div className="sub-panel mb-4">
            <div className="panel-title-row">
              <h3 className="panel-title">Solicitud de Exámenes y Estudios (SS)</h3>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Portafolio SILAB con 1.578 exámenes y códigos CUPS
              </span>
            </div>

            <Select2Search
              category="examen"
              placeholder="Buscar exámenes o estudios a solicitar (ej. Hemograma, Glucosa, Ecografía, Rx)..."
              isMulti={true}
              values={(formData.plan?.requestedExams || []).map(e => e.testName)}
              onChangeMulti={(vals) => {
                const mapped: RequestedExam[] = vals.map(v => ({ testName: v }));
                updateForm({
                  plan: {
                    ...formData.plan,
                    requestedExams: mapped
                  }
                });
              }}
              helperText="Escriba el nombre o código CUPS para agregar órdenes de paraclínicos."
            />
          </div>

          {/* PLAN (P): PROXIMO CONTROL E INTERCONSULTAS */}
          <div className="form-grid-2 mb-4">
            <div className="sub-panel">
              <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>Próximo Control</h4>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Control con resultados en 15 días..."
                value={formData.plan?.nextControl || ''}
                onChange={(e) => {
                  updateForm({
                    plan: {
                      ...formData.plan,
                      nextControl: e.target.value
                    }
                  });
                }}
              />
            </div>

            <div className="sub-panel">
              <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>Remisiones / Interconsultas</h4>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Infectología, Terapia física # 10 (Dr. Chalela)..."
                value={formData.plan?.referrals || ''}
                onChange={(e) => {
                  updateForm({
                    plan: {
                      ...formData.plan,
                      referrals: e.target.value
                    }
                  });
                }}
              />
            </div>
          </div>

          {/* FIRMA DEL MEDICO */}
          <div className="sub-panel mb-4">
            <div className="form-group">
              <label className="form-label required">Firma y Registro del Médico Tratante</label>
              <input
                type="text"
                className="form-input"
                placeholder="Dr. Oscar Leonel Rueda Ochoa - Esp. Medicina Interna"
                value={formData.attendingDoctorSignature}
                onChange={(e) => updateForm({ attendingDoctorSignature: e.target.value })}
                required
              />
            </div>
          </div>

          {/* FEEDBACK DE PERSISTENCIA */}
          {saveStatus && (
            <div className={`status-alert ${saveStatus.success ? 'alert-success' : 'alert-danger'} mt-3 mb-3`}>
              {saveStatus.message}
            </div>
          )}

          <div className="final-actions-panel">
            <div className="left-group">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setCurrentStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                ← Volver a Etapa 2: Examen y Laboratorios
              </button>
            </div>

            <div className="right-group">
              <button
                type="button"
                className="btn-outline-primary"
                onClick={handleCopy}
                title="Copiar evolución médica en formato texto"
              >
                {copyFeedback ? '✓ Copiado al Portapapeles' : 'Copiar Texto al Portapapeles'}
              </button>

              <button
                type="button"
                className="btn-outline-primary"
                onClick={onOpenPrintPreview}
                title="Vista previa e impresión formal de la evolución"
              >
                Previsualizar e Imprimir / PDF
              </button>

              <button
                type="button"
                className="btn-primary btn-save"
                onClick={onSave}
                disabled={isSaving || !formData.patientName}
              >
                {isSaving ? 'Guardando Evolución...' : 'Guardar Evolución Médica'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
