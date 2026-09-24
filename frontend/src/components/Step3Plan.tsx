import React, { useState } from 'react';
import { InpatientConsultation } from '../types/consultation.js';
import { Select2Search } from './Select2Search.js';

interface Step3Props {
  formData: InpatientConsultation;
  updateForm: (fields: Partial<InpatientConsultation>) => void;
  onPrev: () => void;
  onSave: () => Promise<void>;
  onOpenPrintPreview: () => void;
  onCopyClipboard: () => void;
  isSaving: boolean;
  saveStatus: { success?: boolean; message?: string } | null;
}

export const Step3Plan: React.FC<Step3Props> = ({
  formData,
  updateForm,
  onPrev,
  onSave,
  onOpenPrintPreview,
  onCopyClipboard,
  isSaving,
  saveStatus
}) => {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopy = () => {
    onCopyClipboard();
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  return (
    <div className="step-container animate-fade-in">
      {/* 1. SECCION: REVISION DE DATOS Y PARACLINICOS */}
      <div className="clinical-card">
        <div className="card-header">
          <div className="card-badge">Documento Base: Pagina 3</div>
          <h2 className="card-title">Revisión de Datos y Paraclínicos (Data Review)</h2>
          <p className="card-description">Laboratorios, estudios de imagen, electrocardiograma y reportes externos</p>
        </div>

        <div className="form-group">
          <label className="form-label">Resultados Paraclínicos y Estudios de Soporte</label>
          <textarea
            className="form-textarea"
            rows={5}
            placeholder="Ejemplo:
- Hemograma: Leucocitos 11.200 (Neutrófilos 78%), Hb 13.4 g/dL, Plaquetas 240.000.
- Química: Creatinina 1.1 mg/dL, BUN 18 mg/dL, Glucosa 142 mg/dL, Na 138 mEq/L, K 4.1 mEq/L.
- EKG: Ritmo sinusal, FC 78 lpm, sin elevación ni depresión del segmento ST.
- Radiografía de tórax: Sin consolidaciones focales ni derrame pleural evidente..."
            value={formData.dataReview}
            onChange={(e) => updateForm({ dataReview: e.target.value })}
          ></textarea>
        </div>
      </div>

      {/* 2. SECCION: DIAGNOSTICOS Y CIE-10 */}
      <div className="clinical-card">
        <div className="card-header">
          <h2 className="card-title">Diagnósticos Clínicos y Codificación CIE-10</h2>
          <p className="card-description">Búsqueda predictiva de diagnósticos nosológicos y sindrómicos</p>
        </div>

        <div className="sub-panel">
          <Select2Search
            category="diagnostico"
            label="Buscar Diagnósticos (CIE-10 / Términos Clínicos)"
            placeholder="Escriba código o nombre de la patología (ej. I10, diabetes, neumonia, infarto)..."
            isMulti={true}
            values={formData.diagnosesList}
            onChangeMulti={(vals) => updateForm({ diagnosesList: vals })}
            helperText="Seleccione los diagnósticos principales y comorbilidades activas. Puede ingresar términos libres."
          />
        </div>
      </div>

      {/* 3. SECCION: EVALUACION Y PLAN (ASSESSMENT AND PLAN) */}
      <div className="clinical-card">
        <div className="card-header">
          <h2 className="card-title">Evaluación y Plan Terapéutico (Assessment & Plan)</h2>
          <p className="card-description">Análisis clínico integral, conducta médica, metas de hospitalización y órdenes</p>
        </div>

        <div className="form-group">
          <label className="form-label required">Formulación del Problema, Discusión y Conducta Médica</label>
          <textarea
            className="form-textarea"
            rows={8}
            placeholder="Describa el análisis integral:
1. Impresión Diagnóstica / Fisiopatología:
   - Paciente con cuadro compatible con...

2. Plan Diagnóstico:
   - Solicitar curva enzimática, ecocardiograma transtorácico...

3. Plan Terapéutico / Farmacológico:
   - Medidas generales, oxigenoterapia...
   - Esquema de antibióticos / anticoagulación / analgesia...

4. Monitorización y Metas de Egreso:
   - Control estricto de diuresis, signos vitales cada 4 horas..."
            value={formData.assessmentPlan}
            onChange={(e) => updateForm({ assessmentPlan: e.target.value })}
            required
          ></textarea>
        </div>
      </div>

      {/* 4. SECCION: FIRMA DEL PROFESIONAL TRATANTE / RESIDENTE */}
      <div className="clinical-card">
        <div className="card-header">
          <h2 className="card-title">Identificación y Firma del Médico Evaluador</h2>
          <p className="card-description">Validación legal y fecha/hora de refrendo de la nota clínica</p>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label required">Firma / Nombre del Médico Evaluador</label>
            <input
              type="text"
              className="form-input"
              placeholder="Dr(a). Nombre y Registro Médico"
              value={formData.residentSignature}
              onChange={(e) => updateForm({ residentSignature: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Fecha de Cierre</label>
            <input
              type="date"
              className="form-input"
              value={formData.residentDate}
              onChange={(e) => updateForm({ residentDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Hora de Cierre</label>
            <input
              type="time"
              className="form-input"
              value={formData.residentTime}
              onChange={(e) => updateForm({ residentTime: e.target.value })}
              required
            />
          </div>
        </div>

        {/* FEEDBACK DE PERSISTENCIA */}
        {saveStatus && (
          <div className={`status-alert ${saveStatus.success ? 'alert-success' : 'alert-danger'} mt-3`}>
            {saveStatus.message}
          </div>
        )}
      </div>

      {/* BARRA DE ACCIONES FINALES */}
      <div className="final-actions-panel">
        <div className="left-group">
          <button
            type="button"
            className="btn-secondary"
            onClick={onPrev}
          >
            ← Volver a Etapa 2: Examen Físico
          </button>
        </div>

        <div className="right-group">
          <button
            type="button"
            className="btn-outline-primary"
            onClick={handleCopy}
            title="Copiar resumen en formato texto para pegar en historia clínica electrónica"
          >
            {copyFeedback ? '✓ Copiado al Portapapeles' : 'Copiar Texto al Portapapeles'}
          </button>

          <button
            type="button"
            className="btn-outline-primary"
            onClick={onOpenPrintPreview}
            title="Abrir vista de impresión formal y descarga en PDF"
          >
            Previsualizar e Imprimir / PDF
          </button>

          <button
            type="button"
            className="btn-primary btn-save"
            onClick={onSave}
            disabled={isSaving || !formData.patientName || !formData.assessmentPlan}
          >
            {isSaving ? 'Guardando en Base de Datos...' : 'Guardar Consulta en PostgreSQL'}
          </button>
        </div>
      </div>
    </div>
  );
};
