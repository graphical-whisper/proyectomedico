import React, { useState } from 'react';
import { InpatientConsultation } from '../types/consultation.js';

interface PrintableSummaryProps {
  formData: InpatientConsultation;
  summaryText: string;
  onClose: () => void;
}

export const PrintableSummary: React.FC<PrintableSummaryProps> = ({
  formData,
  summaryText,
  onClose
}) => {
  const [copyStatus, setCopyStatus] = useState(false);
  const exam = formData.physicalExam;

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
        {/* BARRA DE HERRAMIENTAS SUPERIOR (NO SE IMPRIME) */}
        <div className="modal-toolbar no-print">
          <div className="toolbar-info">
            <h3 className="toolbar-title">Vista de Impresión y Reporte Clínico</h3>
            <span className="toolbar-subtitle">Documento generado a partir de la plantilla hospitalaria adaptada</span>
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

        {/* DOCUMENTO FORMAL IMPRIMIBLE */}
        <div className="printable-document">
          <div className="doc-institution-header">
            <div className="doc-header-left">
              <h1 className="doc-hospital-name">HOSPITAL UNIVERSITARIO - SERVICIO DE MEDICINA INTERNA</h1>
              <h2 className="doc-sheet-title">
                {formData.visitType === 'consult'
                  ? `INTERCONSULTA MÉDICA HOSPITALARIA (Solicitante: ${formData.requestingPhysician || 'No especificado'})`
                  : 'NOTA DE VISITA HOSPITALARIA INICIAL'}
              </h2>
            </div>
            <div className="doc-header-right">
              <div><strong>Fecha:</strong> {formData.date}</div>
              <div><strong>Hora:</strong> {formData.time}</div>
            </div>
          </div>

          <div className="doc-patient-banner">
            <div><strong>Paciente:</strong> {formData.patientName || 'No indicado'}</div>
            <div><strong>Historia Clínica / Identificación:</strong> {formData.patientIdNumber || 'N/A'}</div>
          </div>

          {/* ALERGIAS Y MEDICACION */}
          <div className="doc-section">
            <h3 className="doc-section-title">1. ALERGIAS Y MEDICACIÓN HABITUAL</h3>
            <p className="doc-text">
              <strong>Alergias:</strong> {formData.nkda ? 'Sin alergias medicamentosas conocidas (NKDA)' : (formData.allergiesList.join(', ') || 'No registradas')}
            </p>
            <p className="doc-text">
              <strong>Medicación previa activa:</strong> {formData.medicationsList.length > 0 ? formData.medicationsList.join('; ') : 'Ninguna reportada'}
              {formData.otcMeds && ' | Incluye medicamentos de venta libre (OTC)'}
              {formData.supplements && ' | Incluye suplementos / fitoterapéuticos'}
            </p>
          </div>

          {/* MOTIVO DE CONSULTA Y HPI */}
          <div className="doc-section">
            <h3 className="doc-section-title">2. MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL (HPI)</h3>
            <p className="doc-text">
              <strong>Motivo de consulta:</strong> {formData.chiefComplaint || 'No especificado'}
            </p>
            {formData.hpiUnableToObtain ? (
              <p className="doc-text warning-text">
                * No fue posible obtener historia clínica completa: {formData.hpiUnableReason || 'Causa no especificada'}
              </p>
            ) : (
              <div className="doc-subgrid">
                {formData.hpiLocation && <div><strong>Localización:</strong> {formData.hpiLocation}</div>}
                {formData.hpiQuality && <div><strong>Carácter:</strong> {formData.hpiQuality}</div>}
                {formData.hpiDuration && <div><strong>Duración:</strong> {formData.hpiDuration}</div>}
                {formData.hpiTiming && <div><strong>Temporalidad:</strong> {formData.hpiTiming}</div>}
                {formData.hpiSeverity && <div><strong>Severidad:</strong> {formData.hpiSeverity}</div>}
                {formData.hpiContext && <div><strong>Contexto:</strong> {formData.hpiContext}</div>}
                {formData.hpiModifyingFactors && <div><strong>Factores modif.:</strong> {formData.hpiModifyingFactors}</div>}
                {formData.hpiAssociatedSymptoms && <div><strong>Síntomas asoc.:</strong> {formData.hpiAssociatedSymptoms}</div>}
              </div>
            )}
            {formData.hpiNarrative && (
              <p className="doc-text mt-2">
                <strong>Narrativa cronológica:</strong> {formData.hpiNarrative}
              </p>
            )}
          </div>

          {/* ANTECEDENTES */}
          <div className="doc-section">
            <h3 className="doc-section-title">3. ANTECEDENTES PERSONALES Y FAMILIARES</h3>
            <p className="doc-text">
              <strong>Médicos / Quirúrgicos:</strong> {formData.pastMedicalSurgical.nonContributory ? 'No contributorios' : (formData.pastMedicalSurgical.conditions.join(', ') || 'Sin antecedentes patológicos relevantes')}
              {formData.pastMedicalSurgical.surgicalHistory && ` | Cx: ${formData.pastMedicalSurgical.surgicalHistory}`}
            </p>
            <p className="doc-text">
              <strong>Familiares:</strong> {formData.familyHistory.nonContributory ? 'No contributorios' : (formData.familyHistory.details || 'Sin antecedentes referidos')}
            </p>
            <p className="doc-text">
              <strong>Hábitos y Sociales:</strong> {formData.socialHistory.nonContributory ? 'No contributorios' : `Alcohol: ${formData.socialHistory.etoh ? 'Positivo' : 'Negativo'} | Tabaco: ${formData.socialHistory.tobaccoUse ? `Positivo (${formData.socialHistory.tobaccoPackYears || ''} paq/año)` : 'Negativo'} | Sustancias: ${formData.socialHistory.ivda ? 'Positivo' : 'Negativo'}`}
              {formData.socialHistory.occupation && ` | Ocupación: ${formData.socialHistory.occupation}`}
            </p>
          </div>

          {/* EXAMEN FISICO */}
          <div className="doc-section">
            <h3 className="doc-section-title">4. EXAMEN FÍSICO MULTISISTÉMICO</h3>
            <div className="doc-vitals-strip">
              <span><strong>T:</strong> {exam.vitals.temperature || '--'} °C</span>
              <span><strong>P:</strong> {exam.vitals.pulse || '--'} lpm ({exam.vitals.pulseRhythm || 'reg'})</span>
              <span><strong>PA:</strong> {exam.vitals.bloodPressure || '--'} mmHg</span>
              <span><strong>FR:</strong> {exam.vitals.respiratoryRate || '--'} rpm</span>
              <span><strong>Peso:</strong> {exam.vitals.weight || '--'} kg</span>
              <span><strong>Talla:</strong> {exam.vitals.height || '--'} m</span>
            </div>
            {exam.appearance && (
              <p className="doc-text mt-1">
                <strong>Aspecto general:</strong> {exam.appearance}
              </p>
            )}
            <div className="doc-exam-summary mt-1">
              <p className="doc-text">
                <strong>Ojos:</strong> {exam.eyes.noScleralIcterus && 'Sin ictericia. '} {exam.eyes.perrla && 'PIRRLA. '} {exam.eyes.comments}
              </p>
              <p className="doc-text">
                <strong>ORL / Cuello:</strong> {exam.ent.clearOropharynx && 'Orofaringe limpia. '} {exam.neck.tracheaMidline && 'Tráquea centrada. '} {exam.neck.noThyroidEnlargementMasses && 'Sin masas tiroideas. '} {exam.neck.comments}
              </p>
              <p className="doc-text">
                <strong>Cardiopulmonar:</strong> {exam.respiratory.clearAuscultationPalpation && 'Campos pulmonares ventilados sin agregados. '} {exam.cardiovascular.nlSoundsNoMurmursGallopsRubs && 'Ruidos cardíacos rítmicos sin soplos. '} {exam.cardiovascular.comments}
              </p>
              <p className="doc-text">
                <strong>Abdomen:</strong> {exam.abdominal.noTendernessNlSounds && 'Blando, no doloroso, RHA presentes. '} {exam.abdominal.noHepatosplenomegaly && 'Sin megalias. '} {exam.abdominal.comments}
              </p>
              <p className="doc-text">
                <strong>Neurológico y Psiquiatría:</strong> {exam.neuro.nlCranialNerves && 'Pares craneales normales. '} {exam.psych.alertOrientedPersonPlaceTime && 'Alerta y orientado en 3 esferas. '} {exam.psych.comments}
              </p>
              {exam.abnormalFindingsSummary && (
                <p className="doc-text highlight-box mt-1">
                  <strong>Hallazgos anormales detallados:</strong> {exam.abnormalFindingsSummary}
                </p>
              )}
            </div>
          </div>

          {/* ESTUDIOS Y PLAN */}
          <div className="doc-section">
            <h3 className="doc-section-title">5. ESTUDIOS PARACLÍNICOS, DIAGNÓSTICOS Y PLAN</h3>
            {formData.dataReview && (
              <div className="mb-2">
                <strong>Revisión de Paraclínicos:</strong>
                <pre className="doc-pre">{formData.dataReview}</pre>
              </div>
            )}
            <div className="mb-2">
              <strong>Diagnósticos Nosológicos y Sindrómicos:</strong>
              <ul className="doc-dx-list">
                {formData.diagnosesList.length > 0 ? (
                  formData.diagnosesList.map((dx, i) => <li key={i}>{dx}</li>)
                ) : (
                  <li>Diagnóstico pendiente de confirmación diagnóstica</li>
                )}
              </ul>
            </div>
            <div>
              <strong>Evaluación y Conducta Terapéutica (Plan):</strong>
              <pre className="doc-pre">{formData.assessmentPlan || 'Continuar plan de manejo instaurado.'}</pre>
            </div>
          </div>

          {/* FIRMAS */}
          <div className="doc-signature-zone">
            <div className="signature-box">
              <div className="signature-line"></div>
              <div className="signature-name">{formData.residentSignature || 'Médico Evaluador / Residente'}</div>
              <div className="signature-details">Firma y Registro Médico</div>
              <div className="signature-details">Fecha: {formData.residentDate || formData.date} | Hora: {formData.residentTime || formData.time}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
