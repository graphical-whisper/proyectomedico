import React, { useState } from 'react';
import { InpatientConsultation, MedicalEvolution } from '../types/consultation.js';

interface PrintableSummaryProps {
  formData: InpatientConsultation | MedicalEvolution;
  summaryText: string;
  onClose: () => void;
}

export const PrintableSummary: React.FC<PrintableSummaryProps> = ({
  formData,
  summaryText,
  onClose
}) => {
  const [copyStatus, setCopyStatus] = useState(false);
  const isEvolution = formData.visitType === 'evolution';

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-container">
        {/* BARRA DE HERRAMIENTAS (NO PRINT) */}
        <div className="modal-toolbar no-print">
          <div className="toolbar-info">
            <h3 className="toolbar-title">
              {isEvolution ? 'Vista de Impresión - Evolución Médica (SOAP)' : 'Vista de Impresión - Consulta Completa'}
            </h3>
            <span className="toolbar-subtitle">Consultorio Dr. Oscar Leonel Rueda Ochoa</span>
          </div>
          <div className="toolbar-actions">
            <button
              type="button"
              className="btn-outline-secondary"
              onClick={handleCopy}
            >
              {copyStatus ? '✓ Copiado' : 'Copiar Texto'}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handlePrint}
            >
              Imprimir / Guardar como PDF
            </button>
            <button
              type="button"
              className="btn-close-modal"
              onClick={onClose}
              title="Cerrar vista"
            >
              ✕
            </button>
          </div>
        </div>

        {/* DOCUMENTO FORMAL IMPRIMIBLE CON ESTILO RECETARIO */}
        <div className="printable-document">
          {/* BANNER OFICIAL DEL RECETARIO / CONSULTORIO DR. OSCAR RUEDA */}
          <div className="doc-prescription-banner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h1 className="doc-prescription-title">
                  Dr. Oscar Leonel Rueda Ochoa
                </h1>
                <div className="doc-prescription-sub">
                  Especialista en Medicina Interna UIS<br />
                  Fellowship American College of Physicians ACP<br />
                  MSc Epidemiología Clínica - MSc Epidemiología Genética<br />
                  Doctorado PhD en Investigación Cardiovascular
                </div>
              </div>
              <div style={{ textAlign: 'right', background: 'rgba(255, 255, 255, 0.18)', padding: '0.5rem 0.85rem', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#ffffff' }}>
                  {isEvolution ? 'Evolución Médica' : formData.visitType === 'consult' ? 'Interconsulta Médica' : 'Consulta Médica'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.95)', marginTop: '0.15rem' }}>
                  Centro Médico Galileo - Bucaramanga
                </div>
              </div>
            </div>
          </div>

          {/* FRANJA DE PACIENTE Y FECHA ESTILO RECETARIO */}
          <div className="doc-patient-banner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.65rem 0.95rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
            <div><strong style={{ color: '#0369a1' }}>Nombre:</strong> {formData.patientName || 'No indicado'}</div>
            <div><strong style={{ color: '#0369a1' }}>Fecha:</strong> {formData.date} ({formData.time})</div>
            <div><strong style={{ color: '#0369a1' }}>Cédula:</strong> {formData.patientIdNumber || 'N/A'}</div>
            {formData.age && <div><strong style={{ color: '#0369a1' }}>Edad:</strong> {formData.age}</div>}
            {formData.biologicalSex && <div><strong style={{ color: '#0369a1' }}>Sexo:</strong> {formData.biologicalSex === 'F' ? 'Femenino' : 'Masculino'}</div>}
            {formData.entity && <div><strong style={{ color: '#0369a1' }}>Entidad:</strong> {formData.entity}</div>}
            {(!isEvolution && (formData as InpatientConsultation).originCity) && <div><strong style={{ color: '#0369a1' }}>Procedencia:</strong> {(formData as InpatientConsultation).originCity}</div>}
            {(!isEvolution && (formData as InpatientConsultation).occupation) && <div><strong style={{ color: '#0369a1' }}>Ocupación:</strong> {(formData as InpatientConsultation).occupation}</div>}
          </div>

          {/* VISTA ESPECIFICA SI ES EVOLUCION MEDICA (SOAP) */}
          {isEvolution ? (
            (() => {
              const evo = formData as MedicalEvolution;
              const v = evo.objective?.vitals;
              return (
                <div>
                  {/* IMPRESION DIAGNOSTICA */}
                  <div className="doc-section">
                    <h3 className="doc-section-title">IMPRESIÓN DIAGNÓSTICA</h3>
                    <ol style={{ paddingLeft: '1.2rem', margin: '0.25rem 0' }}>
                      {evo.diagnosticImpressions && evo.diagnosticImpressions.length > 0 ? (
                        evo.diagnosticImpressions.map((dx, i) => (
                          <li key={i} style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.2rem' }}>{dx}</li>
                        ))
                      ) : (
                        <li>En seguimiento clínico</li>
                      )}
                    </ol>
                  </div>

                  {/* SUBJETIVO (S) */}
                  <div className="doc-section">
                    <h3 className="doc-section-title">SUBJETIVO (S)</h3>
                    <p className="doc-text">{evo.subjective || 'Sin datos adicionales referidos por el paciente.'}</p>
                  </div>

                  {/* OBJETIVO (O) */}
                  <div className="doc-section">
                    <h3 className="doc-section-title">OBJETIVO (O)</h3>
                    {v && (
                      <div className="doc-vitals-strip">
                        <span><strong>Peso:</strong> {v.weight || '--'} kg</span>
                        <span><strong>Talla:</strong> {v.height || '--'} m</span>
                        <span><strong>TA:</strong> {v.bloodPressure || '--'} mmHg</span>
                        <span><strong>FC:</strong> {v.pulse || '--'} lpm</span>
                        <span><strong>FR:</strong> {v.respiratoryRate || '--'} rpm</span>
                        <span><strong>T°:</strong> {v.temperature || 'afebril'}</span>
                      </div>
                    )}
                    {evo.objective?.physicalExamNarrative && (
                      <p className="doc-text mt-1">
                        <strong>Examen Físico:</strong> {evo.objective.physicalExamNarrative}
                      </p>
                    )}
                    {evo.objective?.laboratoryResults && evo.objective.laboratoryResults.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <strong>Laboratorios y Paraclínicos Traídos:</strong>
                        <ul style={{ margin: '0.25rem 0 0 1.2rem', padding: 0 }}>
                          {evo.objective.laboratoryResults.map((lab, idx) => (
                            <li key={idx} style={{ fontSize: '0.88rem' }}>
                              <strong>{lab.testName}</strong>{lab.testCode ? ` (CUPS ${lab.testCode})` : ''}: {lab.result} {lab.unit || ''} {lab.reference ? `[Ref: ${lab.reference}]` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* ANALISIS (A) */}
                  <div className="doc-section">
                    <h3 className="doc-section-title">ANÁLISIS (A)</h3>
                    <p className="doc-text">{evo.analysis || 'Evolución clínica satisfactoria.'}</p>
                  </div>

                  {/* PLAN (P) */}
                  <div className="doc-section">
                    <h3 className="doc-section-title">PLAN (P)</h3>
                    {evo.plan?.medicalConduct && (
                      <p className="doc-text">
                        <strong>Conducta Médica (Cx):</strong> {evo.plan.medicalConduct}
                      </p>
                    )}
                    {evo.plan?.prescriptions && evo.plan.prescriptions.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <strong>Prescripción Farmacológica:</strong>
                        <ol style={{ margin: '0.25rem 0 0 1.2rem', padding: 0 }}>
                          {evo.plan.prescriptions.map((rx, idx) => (
                            <li key={idx} style={{ fontSize: '0.88rem' }}>
                              <strong>{rx.drug}</strong> {rx.dose ? `- ${rx.dose}` : ''}: {rx.instructions}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {evo.plan?.requestedExams && evo.plan.requestedExams.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <strong>Solicitud de Exámenes y Paraclínicos (SS):</strong>
                        <ul style={{ margin: '0.25rem 0 0 1.2rem', padding: 0 }}>
                          {evo.plan.requestedExams.map((ex, idx) => (
                            <li key={idx} style={{ fontSize: '0.88rem' }}>
                              {ex.testName} {ex.testCode ? `(CUPS: ${ex.testCode})` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {evo.plan?.nextControl && (
                      <p className="doc-text mt-1">
                        <strong>Próximo Control:</strong> {evo.plan.nextControl}
                      </p>
                    )}
                    {evo.plan?.referrals && (
                      <p className="doc-text mt-1">
                        <strong>Remisiones:</strong> {evo.plan.referrals}
                      </p>
                    )}
                  </div>

                  {/* FIRMA */}
                  <div className="doc-signature-zone">
                    <div className="signature-box">
                      <div className="signature-line"></div>
                      <div className="signature-name">{evo.attendingDoctorSignature || 'Dr. Oscar Leonel Rueda Ochoa'}</div>
                      <div className="signature-details">Especialista en Medicina Interna - UIS</div>
                      <div className="signature-details">Fecha: {evo.date} | Hora: {evo.time}</div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            /* VISTA HISTORIA CLINICA COMPLETA DE PRIMERA VEZ */
            (() => {
              const cons = formData as InpatientConsultation;
              const exam = cons.physicalExam;
              const pms = cons.pastMedicalSurgical;
              return (
                <div>
                  {/* MOTIVO DE CONSULTA Y HPI */}
                  <div className="doc-section">
                    <h3 className="doc-section-title">MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL</h3>
                    <p className="doc-text">
                      <strong>Motivo de consulta:</strong> {cons.chiefComplaint || 'No especificado'}
                    </p>
                    {cons.hpiNarrative && (
                      <p className="doc-text">
                        <strong>Enfermedad actual:</strong> {cons.hpiNarrative}
                      </p>
                    )}
                  </div>

                  {/* ANTECEDENTES CLINICOS FUSIONADOS */}
                  <div className="doc-section">
                    <h3 className="doc-section-title">ANTECEDENTES</h3>
                    {pms?.fixedPathologies && (
                      <p className="doc-text">
                        <strong>Patológicos:</strong> {[
                          pms.fixedPathologies.htaCronica && 'HTA crónica',
                          pms.fixedPathologies.hipoTa && 'Hipotensión',
                          pms.fixedPathologies.dmnid && 'DMNID',
                          pms.fixedPathologies.hipoglicemia && 'Hipoglicemia',
                          pms.fixedPathologies.dislipidemia && 'Dislipidemia',
                          pms.fixedPathologies.problemasTiroides && 'Problemas tiroides',
                          pms.fixedPathologies.asma && 'Asma',
                          pms.fixedPathologies.epoc && 'EPOC',
                          pms.fixedPathologies.erc && 'ERC',
                          pms.fixedPathologies.cardiopatiaIsquemica && 'Cardiopatía isquémica',
                          pms.fixedPathologies.obesidad && 'Obesidad',
                          pms.fixedPathologies.cancer && 'Cáncer',
                          ...(pms.conditions || [])
                        ].filter(Boolean).join(', ') || 'No refiere patologías previas'}
                      </p>
                    )}
                    {pms?.surgicalHistory && <p className="doc-text"><strong>Quirúrgicos:</strong> {pms.surgicalHistory}</p>}
                    {pms?.toxicHistory && <p className="doc-text"><strong>Tóxicos:</strong> {pms.toxicHistory}</p>}
                    <p className="doc-text"><strong>Alérgicos:</strong> {cons.nkda ? '(-) Sin alergias conocidas' : (cons.allergiesList.join(', ') || '(-)')}</p>
                    {pms?.traumaticHistory && <p className="doc-text"><strong>Traumáticos:</strong> {pms.traumaticHistory}</p>}
                    {pms?.transfusionHistory && (
                      <p className="doc-text">
                        <strong>Transfusionales:</strong> {pms.transfusionHistory.hasTransfusions ? '(+) Positivo' : '(-) Negativo'} | Grupo y Rh: {pms.transfusionHistory.bloodType || 'No determinado'}
                      </p>
                    )}
                    {pms?.hospitalHistory && <p className="doc-text"><strong>Hospitalarios:</strong> {pms.hospitalHistory}</p>}
                    {cons.gynecologicalHistory?.applicable && (
                      <p className="doc-text">
                        <strong>Ginecológicos:</strong> G: {cons.gynecologicalHistory.gravidity || 0} P: {cons.gynecologicalHistory.parity || 0} A: {cons.gynecologicalHistory.abortions || 0} V: {cons.gynecologicalHistory.livingChildren || 0} | FUR: {cons.gynecologicalHistory.lastMenstrualPeriod || 'No refiere'} | Ciclos: {cons.gynecologicalHistory.cycleType || 'R'} ({cons.gynecologicalHistory.cycleDuration || '--'} días) | Planificación: {cons.gynecologicalHistory.isFamilyPlanning ? `Sí (${cons.gynecologicalHistory.familyPlanningMethod})` : 'No'}
                      </p>
                    )}
                    {pms?.pharmacologicalHistory && <p className="doc-text"><strong>Farmacológicos:</strong> {pms.pharmacologicalHistory}</p>}
                    {cons.socialHistory && (
                      <p className="doc-text">
                        <strong>Hábitos:</strong> Tabaco: {cons.socialHistory.tobacco?.uses ? `(+) ${cons.socialHistory.tobacco.frequency} ${cons.socialHistory.tobacco.productType}` : '(-)'} | Alcohol: {cons.socialHistory.alcohol?.uses ? `(+) ${cons.socialHistory.alcohol.frequency} ${cons.socialHistory.alcohol.beverageType}` : '(-)'} | Sustancias: {cons.socialHistory.psychoactive?.uses ? `(+) ${cons.socialHistory.psychoactive.substance}` : '(-)'} | Parejas sexuales: {cons.socialHistory.sexualPartnersCount || 'N/R'}
                      </p>
                    )}
                    {cons.familyHistory && (
                      <p className="doc-text">
                        <strong>Familiares:</strong> {[
                          cons.familyHistory.parents?.diseases?.length ? `Padres: ${cons.familyHistory.parents.diseases.join(', ')} (${cons.familyHistory.parents.details || ''})` : null,
                          cons.familyHistory.siblings?.diseases?.length ? `Hermanos: ${cons.familyHistory.siblings.diseases.join(', ')} (${cons.familyHistory.siblings.details || ''})` : null,
                          cons.familyHistory.grandparents?.diseases?.length ? `Abuelos: ${cons.familyHistory.grandparents.diseases.join(', ')} (${cons.familyHistory.grandparents.details || ''})` : null
                        ].filter(Boolean).join(' | ') || 'Sin antecedentes reportados'}
                      </p>
                    )}
                  </div>

                  {/* EXAMEN FISICO */}
                  <div className="doc-section">
                    <h3 className="doc-section-title">EXAMEN FÍSICO</h3>
                    <div className="doc-vitals-strip">
                      <span><strong>Peso:</strong> {exam.vitals.weight || '--'} kg</span>
                      <span><strong>Talla:</strong> {exam.vitals.height || '--'} m</span>
                      <span><strong>TA:</strong> {exam.vitals.bloodPressure || '--'} mmHg</span>
                      <span><strong>FC:</strong> {exam.vitals.pulse || '--'} lpm</span>
                      <span><strong>FR:</strong> {exam.vitals.respiratoryRate || '--'} rpm</span>
                      <span><strong>T°:</strong> {exam.vitals.temperature || 'afebril'}</span>
                    </div>
                    {exam.appearance && <p className="doc-text mt-1"><strong>Aspecto:</strong> {exam.appearance}</p>}
                    {exam.abnormalFindingsSummary && <p className="doc-text mt-1"><strong>Hallazgos:</strong> {exam.abnormalFindingsSummary}</p>}
                  </div>

                  {/* DIAGNOSTICOS Y PLAN */}
                  <div className="doc-section">
                    <h3 className="doc-section-title">DIAGNÓSTICOS Y PLAN TERAPÉUTICO</h3>
                    <ul className="doc-dx-list">
                      {cons.diagnosesList.length > 0 ? (
                        cons.diagnosesList.map((dx, i) => <li key={i}>{dx}</li>)
                      ) : (
                        <li>En estudio clínico</li>
                      )}
                    </ul>
                    {cons.requestedExams && cons.requestedExams.length > 0 && (
                      <div className="mt-2">
                        <strong>Solicitud de Exámenes (SS):</strong>
                        <ul>
                          {cons.requestedExams.map((ex, i) => (
                            <li key={i}>{ex.testName} {ex.testCode ? `(CUPS: ${ex.testCode})` : ''}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <pre className="doc-pre mt-2">{cons.assessmentPlan}</pre>
                  </div>

                  {/* FIRMA */}
                  <div className="doc-signature-zone">
                    <div className="signature-box">
                      <div className="signature-line"></div>
                      <div className="signature-name">{cons.residentSignature || 'Dr. Oscar Leonel Rueda Ochoa'}</div>
                      <div className="signature-details">Especialista en Medicina Interna</div>
                      <div className="signature-details">Fecha: {cons.residentDate || cons.date} | Hora: {cons.residentTime || cons.time}</div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};
