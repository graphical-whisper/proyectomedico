import React from 'react';
import { InpatientConsultation, PhysicalExamSystems } from '../types/consultation.js';
import { Select2Search } from './Select2Search.js';

interface Step2Props {
  formData: InpatientConsultation;
  updateForm: (fields: Partial<InpatientConsultation>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step2PhysicalExam: React.FC<Step2Props> = ({
  formData,
  updateForm,
  onNext,
  onPrev
}) => {
  const exam = formData.physicalExam;

  const updateExam = (patch: Partial<PhysicalExamSystems>) => {
    updateForm({
      physicalExam: {
        ...formData.physicalExam,
        ...patch
      }
    });
  };

  const updateVitals = (vitalsPatch: Partial<typeof exam.vitals>) => {
    updateExam({
      vitals: {
        ...exam.vitals,
        ...vitalsPatch
      }
    });
  };

  // Cálculo automático del IMC (Índice de Masa Corporal)
  const calcBMI = (): { bmi: string; label: string; badgeClass: string } => {
    const w = parseFloat(exam.vitals.weight || '0');
    const h = parseFloat(exam.vitals.height || '0');
    if (w > 0 && h > 0) {
      // Normalizar altura si la ingresan en cm
      const heightInMeters = h > 3 ? h / 100 : h;
      const val = w / (heightInMeters * heightInMeters);
      const bmiStr = val.toFixed(1);
      if (val < 18.5) return { bmi: bmiStr, label: 'Bajo peso', badgeClass: 'badge-warning' };
      if (val < 25.0) return { bmi: bmiStr, label: 'Normal / Eutrófico', badgeClass: 'badge-success' };
      if (val < 30.0) return { bmi: bmiStr, label: 'Sobrepeso', badgeClass: 'badge-warning' };
      return { bmi: bmiStr, label: 'Obesidad', badgeClass: 'badge-danger' };
    }
    return { bmi: '--', label: 'Sin datos de peso/talla', badgeClass: 'badge-neutral' };
  };

  const bmiInfo = calcBMI();

  // Función para marcar examen físico normal estándar
  const handleSetStandardNormalExam = () => {
    updateExam({
      appearance: 'Paciente en aparente buen estado general, afebril, orientado, sin dificultad respiratoria evidente.',
      eyes: { noScleralIcterus: true, perrla: true, nlFundusExam: true, comments: '' },
      ent: { nlHearing: true, nlCanalsTympanic: true, nlTeethLipsGums: true, clearOropharynx: true, comments: '' },
      neck: { nlAppearanceMovementsJvp: true, tracheaMidline: true, noThyroidEnlargementMasses: true, comments: '' },
      respiratory: { symmetricalExpansion: true, clearAuscultationPalpation: true, nlPercussion: true, comments: '' },
      breast: { nlSymmetry: true, noMassesTenderness: true, comments: '' },
      cardiovascular: {
        nlSoundsNoMurmursGallopsRubs: true,
        noJvd: true,
        noCarotidBruits: true,
        nlPmiNoThrill: true,
        nlPulses: true,
        pulseFemoral: true,
        pulsePedal: true,
        pulseOther: '',
        comments: ''
      },
      abdominal: {
        noTendernessNlSounds: true,
        noHernias: true,
        noHepatosplenomegaly: true,
        nlDigitalRectalExam: true,
        negHemoccult: true,
        comments: ''
      },
      lymphatic: {
        noAdenopathy: true,
        noAdenopathyCervical: true,
        noAdenopathySupraclavicular: true,
        noAdenopathyAxillary: true,
        noAdenopathyInguinal: true,
        comments: ''
      },
      musculoskeletal: { nlGait: true, noClubbingCyanosis: true, nlSymmetryRomStrengthTone: true, comments: '' },
      skin: { noRashesUlcers: true, noNodules: true, comments: '' },
      neuro: { nlCranialNerves: true, nlReflexes: true, nlSensation: true, comments: '' },
      psych: { alertOrientedPersonPlaceTime: true, intactMemory: true, nlAffectJudgementInsight: true, comments: '' }
    });
  };

  const handleResetExam = () => {
    updateExam({
      appearance: '',
      eyes: { noScleralIcterus: false, perrla: false, nlFundusExam: false, comments: '' },
      ent: { nlHearing: false, nlCanalsTympanic: false, nlTeethLipsGums: false, clearOropharynx: false, comments: '' },
      neck: { nlAppearanceMovementsJvp: false, tracheaMidline: false, noThyroidEnlargementMasses: false, comments: '' },
      respiratory: { symmetricalExpansion: false, clearAuscultationPalpation: false, nlPercussion: false, comments: '' },
      breast: { nlSymmetry: false, noMassesTenderness: false, comments: '' },
      cardiovascular: {
        nlSoundsNoMurmursGallopsRubs: false,
        noJvd: false,
        noCarotidBruits: false,
        nlPmiNoThrill: false,
        nlPulses: false,
        pulseFemoral: false,
        pulsePedal: false,
        pulseOther: '',
        comments: ''
      },
      abdominal: {
        noTendernessNlSounds: false,
        noHernias: false,
        noHepatosplenomegaly: false,
        nlDigitalRectalExam: false,
        negHemoccult: false,
        comments: ''
      },
      lymphatic: {
        noAdenopathy: false,
        noAdenopathyCervical: false,
        noAdenopathySupraclavicular: false,
        noAdenopathyAxillary: false,
        noAdenopathyInguinal: false,
        comments: ''
      },
      musculoskeletal: { nlGait: false, noClubbingCyanosis: false, nlSymmetryRomStrengthTone: false, comments: '' },
      skin: { noRashesUlcers: false, noNodules: false, comments: '' },
      neuro: { nlCranialNerves: false, nlReflexes: false, nlSensation: false, comments: '' },
      psych: { alertOrientedPersonPlaceTime: false, intactMemory: false, nlAffectJudgementInsight: false, comments: '' },
      abnormalFindingsSummary: ''
    });
  };

  return (
    <div className="step-container animate-fade-in">
      {/* 1. SECCION: SIGNOS VITALES Y ESTADO GENERAL */}
      <div className="clinical-card">
        <div className="card-header">
          <div className="card-badge">Documento Base: Pagina 2</div>
          <h2 className="card-title">Signos Vitales y Aspecto General</h2>
          <p className="card-description">Parámetros hemodinámicos basales y primera impresión clínica</p>
        </div>

        <div className="vitals-dashboard-grid">
          <div className="vital-item">
            <span className="vital-label">Temperatura (T)</span>
            <div className="input-unit-wrap">
              <input
                type="text"
                className="form-input vital-input"
                placeholder="36.5"
                value={exam.vitals.temperature || ''}
                onChange={(e) => updateVitals({ temperature: e.target.value })}
              />
              <span className="unit-label">°C</span>
            </div>
          </div>

          <div className="vital-item">
            <span className="vital-label">Pulso (P)</span>
            <div className="input-unit-wrap">
              <input
                type="text"
                className="form-input vital-input"
                placeholder="76"
                value={exam.vitals.pulse || ''}
                onChange={(e) => updateVitals({ pulse: e.target.value })}
              />
              <span className="unit-label">lpm</span>
            </div>
            <div className="vital-sub-toggle">
              <button
                type="button"
                className={`mini-toggle-btn ${exam.vitals.pulseRhythm === 'regular' || !exam.vitals.pulseRhythm ? 'is-active' : ''}`}
                onClick={() => updateVitals({ pulseRhythm: 'regular' })}
              >
                Regular
              </button>
              <button
                type="button"
                className={`mini-toggle-btn ${exam.vitals.pulseRhythm === 'irregular' ? 'is-active' : ''}`}
                onClick={() => updateVitals({ pulseRhythm: 'irregular' })}
              >
                Irregular
              </button>
            </div>
          </div>

          <div className="vital-item">
            <span className="vital-label">Presión Arterial (PA)</span>
            <div className="input-unit-wrap">
              <input
                type="text"
                className="form-input vital-input"
                placeholder="120/80"
                value={exam.vitals.bloodPressure || ''}
                onChange={(e) => updateVitals({ bloodPressure: e.target.value })}
              />
              <span className="unit-label">mmHg</span>
            </div>
            <div className="vital-sub-toggle">
              <button
                type="button"
                className={`mini-toggle-btn ${exam.vitals.bpPosition === 'sitting' || !exam.vitals.bpPosition ? 'is-active' : ''}`}
                onClick={() => updateVitals({ bpPosition: 'sitting' })}
              >
                Sentado
              </button>
              <button
                type="button"
                className={`mini-toggle-btn ${exam.vitals.bpPosition === 'supine' ? 'is-active' : ''}`}
                onClick={() => updateVitals({ bpPosition: 'supine' })}
              >
                Supino
              </button>
            </div>
          </div>

          <div className="vital-item">
            <span className="vital-label">Frecuencia Resp. (FR)</span>
            <div className="input-unit-wrap">
              <input
                type="text"
                className="form-input vital-input"
                placeholder="16"
                value={exam.vitals.respiratoryRate || ''}
                onChange={(e) => updateVitals({ respiratoryRate: e.target.value })}
              />
              <span className="unit-label">rpm</span>
            </div>
          </div>

          <div className="vital-item">
            <span className="vital-label">Peso (WT)</span>
            <div className="input-unit-wrap">
              <input
                type="text"
                className="form-input vital-input"
                placeholder="70"
                value={exam.vitals.weight || ''}
                onChange={(e) => updateVitals({ weight: e.target.value })}
              />
              <span className="unit-label">kg</span>
            </div>
          </div>

          <div className="vital-item">
            <span className="vital-label">Talla / Estatura (HT)</span>
            <div className="input-unit-wrap">
              <input
                type="text"
                className="form-input vital-input"
                placeholder="1.72"
                value={exam.vitals.height || ''}
                onChange={(e) => updateVitals({ height: e.target.value })}
              />
              <span className="unit-label">m</span>
            </div>
          </div>

          <div className="vital-item bmi-item">
            <span className="vital-label">IMC Calculado</span>
            <div className="bmi-display">
              <span className="bmi-value">{bmiInfo.bmi}</span>
              <span className={`bmi-badge ${bmiInfo.badgeClass}`}>{bmiInfo.label}</span>
            </div>
          </div>
        </div>

        <div className="vitals-bottom-bar mt-3">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={exam.vitals.seeFlowSheet}
              onChange={(e) => updateVitals({ seeFlowSheet: e.target.checked })}
            />
            Ver registros continuos en hoja de signos vitales (Flow Sheet)
          </label>
        </div>

        <div className="form-group mt-3">
          <label className="form-label">Aspecto General del Paciente</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ej. Paciente alerta, orientado, sin signos de dificultad respiratoria, con facies no dolorosa, hidratado..."
            value={exam.appearance || ''}
            onChange={(e) => updateExam({ appearance: e.target.value })}
          />
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS RAPIDAS DE EXAMEN */}
      <div className="exam-quick-toolbar">
        <span className="quick-toolbar-text">
          Llenado rápido de exploración física:
        </span>
        <div className="btn-group">
          <button
            type="button"
            className="btn-success-soft"
            onClick={handleSetStandardNormalExam}
          >
            ✓ Marcar Examen Estándar Normal
          </button>
          <button
            type="button"
            className="btn-ghost-danger"
            onClick={handleResetExam}
          >
            Limpiar Casillas
          </button>
        </div>
      </div>

      {/* 2. SECCION: EXPLORACION FISICA POR SISTEMAS */}
      <div className="clinical-card">
        <div className="card-header">
          <h2 className="card-title">Exploración Multisistémica</h2>
          <p className="card-description">Verificación de hallazgos por sistemas según estándar hospitalario</p>
        </div>

        <div className="systems-exam-grid">
          {/* OJOS */}
          <div className="system-exam-box">
            <h4 className="system-exam-title">Ojos</h4>
            <div className="exam-checkboxes-stack">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.eyes.noScleralIcterus}
                  onChange={(e) => updateExam({ eyes: { ...exam.eyes, noScleralIcterus: e.target.checked } })}
                />
                Sin ictericia escleral
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.eyes.perrla}
                  onChange={(e) => updateExam({ eyes: { ...exam.eyes, perrla: e.target.checked } })}
                />
                PIRRLA (Pupilas isocóricas reactivas luz y acomodación)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.eyes.nlFundusExam}
                  onChange={(e) => updateExam({ eyes: { ...exam.eyes, nlFundusExam: e.target.checked } })}
                />
                Fondo de ojo normal
              </label>
            </div>
            <input
              type="text"
              className="form-input mini-input mt-2"
              placeholder="Comentarios / Hallazgos en ojos..."
              value={exam.eyes.comments || ''}
              onChange={(e) => updateExam({ eyes: { ...exam.eyes, comments: e.target.value } })}
            />
          </div>

          {/* OIDO, NARIZ, BOCA, GARGANTA */}
          <div className="system-exam-box">
            <h4 className="system-exam-title">Oído / Nariz / Boca / Faringe</h4>
            <div className="exam-checkboxes-stack">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.ent.nlHearing}
                  onChange={(e) => updateExam({ ent: { ...exam.ent, nlHearing: e.target.checked } })}
                />
                Audición normal
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.ent.nlCanalsTympanic}
                  onChange={(e) => updateExam({ ent: { ...exam.ent, nlCanalsTympanic: e.target.checked } })}
                />
                Conductos auditivos y membrana timpánica nl
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.ent.nlTeethLipsGums}
                  onChange={(e) => updateExam({ ent: { ...exam.ent, nlTeethLipsGums: e.target.checked } })}
                />
                Piezas dentales, labios y encías nl
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.ent.clearOropharynx}
                  onChange={(e) => updateExam({ ent: { ...exam.ent, clearOropharynx: e.target.checked } })}
                />
                Orofaringe sin exudados / despejada
              </label>
            </div>
            <input
              type="text"
              className="form-input mini-input mt-2"
              placeholder="Comentarios..."
              value={exam.ent.comments || ''}
              onChange={(e) => updateExam({ ent: { ...exam.ent, comments: e.target.value } })}
            />
          </div>

          {/* CUELLO */}
          <div className="system-exam-box">
            <h4 className="system-exam-title">Cuello</h4>
            <div className="exam-checkboxes-stack">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.neck.nlAppearanceMovementsJvp}
                  onChange={(e) => updateExam({ neck: { ...exam.neck, nlAppearanceMovementsJvp: e.target.checked } })}
                />
                Aspecto y movilidad nl; PVY normal
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.neck.tracheaMidline}
                  onChange={(e) => updateExam({ neck: { ...exam.neck, tracheaMidline: e.target.checked } })}
                />
                Tráquea en línea media
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.neck.noThyroidEnlargementMasses}
                  onChange={(e) => updateExam({ neck: { ...exam.neck, noThyroidEnlargementMasses: e.target.checked } })}
                />
                Sin bocio, masas ni adenopatías
              </label>
            </div>
            <input
              type="text"
              className="form-input mini-input mt-2"
              placeholder="Comentarios..."
              value={exam.neck.comments || ''}
              onChange={(e) => updateExam({ neck: { ...exam.neck, comments: e.target.value } })}
            />
          </div>

          {/* RESPIRATORIO */}
          <div className="system-exam-box">
            <h4 className="system-exam-title">Tórax y Aparato Respiratorio</h4>
            <div className="exam-checkboxes-stack">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.respiratory.symmetricalExpansion}
                  onChange={(e) => updateExam({ respiratory: { ...exam.respiratory, symmetricalExpansion: e.target.checked } })}
                />
                Expansión torácica y esfuerzo simétricos
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.respiratory.clearAuscultationPalpation}
                  onChange={(e) => updateExam({ respiratory: { ...exam.respiratory, clearAuscultationPalpation: e.target.checked } })}
                />
                Murmullo vesicular limpio a auscultación
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.respiratory.nlPercussion}
                  onChange={(e) => updateExam({ respiratory: { ...exam.respiratory, nlPercussion: e.target.checked } })}
                />
                Percusión normal / sonoridad conservada
              </label>
            </div>
            <input
              type="text"
              className="form-input mini-input mt-2"
              placeholder="Comentarios..."
              value={exam.respiratory.comments || ''}
              onChange={(e) => updateExam({ respiratory: { ...exam.respiratory, comments: e.target.value } })}
            />
          </div>

          {/* CARDIOVASCULAR */}
          <div className="system-exam-box">
            <h4 className="system-exam-title">Aparato Cardiovascular</h4>
            <div className="exam-checkboxes-stack">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.cardiovascular.nlSoundsNoMurmursGallopsRubs}
                  onChange={(e) => updateExam({ cardiovascular: { ...exam.cardiovascular, nlSoundsNoMurmursGallopsRubs: e.target.checked } })}
                />
                Ruidos cardíacos rítmicos, sin soplos, galope ni roce
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.cardiovascular.noJvd}
                  onChange={(e) => updateExam({ cardiovascular: { ...exam.cardiovascular, noJvd: e.target.checked } })}
                />
                Sin ingurgitación venosa yugular
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.cardiovascular.noCarotidBruits}
                  onChange={(e) => updateExam({ cardiovascular: { ...exam.cardiovascular, noCarotidBruits: e.target.checked } })}
                />
                Sin soplos carotídeos
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.cardiovascular.nlPmiNoThrill}
                  onChange={(e) => updateExam({ cardiovascular: { ...exam.cardiovascular, nlPmiNoThrill: e.target.checked } })}
                />
                Choque de punta (PMI) normal, sin frémito
              </label>
              <div className="pulses-subgroup">
                <span className="subgroup-label">Pulsos periféricos normales:</span>
                <div className="pulses-checkbox-row">
                  <label className="mini-check">
                    <input
                      type="checkbox"
                      checked={exam.cardiovascular.pulseFemoral}
                      onChange={(e) => updateExam({ cardiovascular: { ...exam.cardiovascular, pulseFemoral: e.target.checked } })}
                    />
                    Femoral
                  </label>
                  <label className="mini-check">
                    <input
                      type="checkbox"
                      checked={exam.cardiovascular.pulsePedal}
                      onChange={(e) => updateExam({ cardiovascular: { ...exam.cardiovascular, pulsePedal: e.target.checked } })}
                    />
                    Pedio
                  </label>
                  <input
                    type="text"
                    className="form-input mini-input inline-mini"
                    placeholder="Otro pulso..."
                    value={exam.cardiovascular.pulseOther || ''}
                    onChange={(e) => updateExam({ cardiovascular: { ...exam.cardiovascular, pulseOther: e.target.value } })}
                  />
                </div>
              </div>
            </div>
            <input
              type="text"
              className="form-input mini-input mt-2"
              placeholder="Comentarios..."
              value={exam.cardiovascular.comments || ''}
              onChange={(e) => updateExam({ cardiovascular: { ...exam.cardiovascular, comments: e.target.value } })}
            />
          </div>

          {/* MAMAS */}
          <div className="system-exam-box">
            <h4 className="system-exam-title">Mamas y Axilas</h4>
            <div className="exam-checkboxes-stack">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.breast.nlSymmetry}
                  onChange={(e) => updateExam({ breast: { ...exam.breast, nlSymmetry: e.target.checked } })}
                />
                Simetría mamaria normal
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.breast.noMassesTenderness}
                  onChange={(e) => updateExam({ breast: { ...exam.breast, noMassesTenderness: e.target.checked } })}
                />
                Sin masas ni dolor a la palpación en mamas o axilas
              </label>
            </div>
            <input
              type="text"
              className="form-input mini-input mt-2"
              placeholder="Comentarios..."
              value={exam.breast.comments || ''}
              onChange={(e) => updateExam({ breast: { ...exam.breast, comments: e.target.value } })}
            />
          </div>

          {/* ABDOMEN */}
          <div className="system-exam-box">
            <h4 className="system-exam-title">Abdomen</h4>
            <div className="exam-checkboxes-stack">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.abdominal.noTendernessNlSounds}
                  onChange={(e) => updateExam({ abdominal: { ...exam.abdominal, noTendernessNlSounds: e.target.checked } })}
                />
                No doloroso a palpación; ruidos hidroaéreos nl
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.abdominal.noHernias}
                  onChange={(e) => updateExam({ abdominal: { ...exam.abdominal, noHernias: e.target.checked } })}
                />
                Sin defectos herniarios
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.abdominal.noHepatosplenomegaly}
                  onChange={(e) => updateExam({ abdominal: { ...exam.abdominal, noHepatosplenomegaly: e.target.checked } })}
                />
                Sin visceromegalias (no hepatomegalia ni esplenomegalia)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.abdominal.nlDigitalRectalExam}
                  onChange={(e) => updateExam({ abdominal: { ...exam.abdominal, nlDigitalRectalExam: e.target.checked } })}
                />
                Tacto rectal normal (si fue realizado)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.abdominal.negHemoccult}
                  onChange={(e) => updateExam({ abdominal: { ...exam.abdominal, negHemoccult: e.target.checked } })}
                />
                Sangre oculta en heces negativa
              </label>
            </div>
            <input
              type="text"
              className="form-input mini-input mt-2"
              placeholder="Comentarios..."
              value={exam.abdominal.comments || ''}
              onChange={(e) => updateExam({ abdominal: { ...exam.abdominal, comments: e.target.value } })}
            />
          </div>

          {/* LINFATICO */}
          <div className="system-exam-box">
            <h4 className="system-exam-title">Sistema Linfático</h4>
            <span className="subgroup-label">Sin adenomegalias palpables en:</span>
            <div className="exam-checkboxes-stack mt-1">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.lymphatic.noAdenopathyCervical}
                  onChange={(e) => updateExam({ lymphatic: { ...exam.lymphatic, noAdenopathyCervical: e.target.checked } })}
                />
                Cervical
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.lymphatic.noAdenopathySupraclavicular}
                  onChange={(e) => updateExam({ lymphatic: { ...exam.lymphatic, noAdenopathySupraclavicular: e.target.checked } })}
                />
                Supraclavicular
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.lymphatic.noAdenopathyAxillary}
                  onChange={(e) => updateExam({ lymphatic: { ...exam.lymphatic, noAdenopathyAxillary: e.target.checked } })}
                />
                Axilar
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.lymphatic.noAdenopathyInguinal}
                  onChange={(e) => updateExam({ lymphatic: { ...exam.lymphatic, noAdenopathyInguinal: e.target.checked } })}
                />
                Inguinal
              </label>
            </div>
            <input
              type="text"
              className="form-input mini-input mt-2"
              placeholder="Comentarios..."
              value={exam.lymphatic.comments || ''}
              onChange={(e) => updateExam({ lymphatic: { ...exam.lymphatic, comments: e.target.value } })}
            />
          </div>

          {/* MUSCULOESQUELETICO */}
          <div className="system-exam-box">
            <h4 className="system-exam-title">Aparato Locomotor / Musculoesquelético</h4>
            <div className="exam-checkboxes-stack">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.musculoskeletal.nlGait}
                  onChange={(e) => updateExam({ musculoskeletal: { ...exam.musculoskeletal, nlGait: e.target.checked } })}
                />
                Marcha normal
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.musculoskeletal.noClubbingCyanosis}
                  onChange={(e) => updateExam({ musculoskeletal: { ...exam.musculoskeletal, noClubbingCyanosis: e.target.checked } })}
                />
                Sin acropaquia ni cianosis periférica
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.musculoskeletal.nlSymmetryRomStrengthTone}
                  onChange={(e) => updateExam({ musculoskeletal: { ...exam.musculoskeletal, nlSymmetryRomStrengthTone: e.target.checked } })}
                />
                Simetría, arcos de movimiento (ROM), fuerza y tono nl
              </label>
            </div>
            <input
              type="text"
              className="form-input mini-input mt-2"
              placeholder="Comentarios..."
              value={exam.musculoskeletal.comments || ''}
              onChange={(e) => updateExam({ musculoskeletal: { ...exam.musculoskeletal, comments: e.target.value } })}
            />
          </div>

          {/* PIEL */}
          <div className="system-exam-box">
            <h4 className="system-exam-title">Piel y Faneras</h4>
            <div className="exam-checkboxes-stack">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.skin.noRashesUlcers}
                  onChange={(e) => updateExam({ skin: { ...exam.skin, noRashesUlcers: e.target.checked } })}
                />
                Sin exantemas, erupciones ni úlceras
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.skin.noNodules}
                  onChange={(e) => updateExam({ skin: { ...exam.skin, noNodules: e.target.checked } })}
                />
                Sin nódulos cutáneos o subcutáneos
              </label>
            </div>
            <input
              type="text"
              className="form-input mini-input mt-2"
              placeholder="Comentarios..."
              value={exam.skin.comments || ''}
              onChange={(e) => updateExam({ skin: { ...exam.skin, comments: e.target.value } })}
            />
          </div>

          {/* NEUROLOGICO */}
          <div className="system-exam-box">
            <h4 className="system-exam-title">Sistema Neurológico</h4>
            <div className="exam-checkboxes-stack">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.neuro.nlCranialNerves}
                  onChange={(e) => updateExam({ neuro: { ...exam.neuro, nlCranialNerves: e.target.checked } })}
                />
                Pares craneales (I a XII) explorados y normales
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.neuro.nlReflexes}
                  onChange={(e) => updateExam({ neuro: { ...exam.neuro, nlReflexes: e.target.checked } })}
                />
                Reflejos osteotendinosos simétricos y normorreactivos
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.neuro.nlSensation}
                  onChange={(e) => updateExam({ neuro: { ...exam.neuro, nlSensation: e.target.checked } })}
                />
                Sensibilidad superficial y profunda conservada
              </label>
            </div>
            <input
              type="text"
              className="form-input mini-input mt-2"
              placeholder="Comentarios..."
              value={exam.neuro.comments || ''}
              onChange={(e) => updateExam({ neuro: { ...exam.neuro, comments: e.target.value } })}
            />
          </div>

          {/* PSIQUIATRICO / ESTADO MENTAL */}
          <div className="system-exam-box">
            <h4 className="system-exam-title">Esfera Psiquiátrica y Estado Mental</h4>
            <div className="exam-checkboxes-stack">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.psych.alertOrientedPersonPlaceTime}
                  onChange={(e) => updateExam({ psych: { ...exam.psych, alertOrientedPersonPlaceTime: e.target.checked } })}
                />
                Alerta, orientado en persona, espacio y tiempo
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.psych.intactMemory}
                  onChange={(e) => updateExam({ psych: { ...exam.psych, intactMemory: e.target.checked } })}
                />
                Memoria a corto y largo plazo conservada
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.psych.nlAffectJudgementInsight}
                  onChange={(e) => updateExam({ psych: { ...exam.psych, nlAffectJudgementInsight: e.target.checked } })}
                />
                Afecto modulado, juicio e introspección adecuados
              </label>
            </div>
            <input
              type="text"
              className="form-input mini-input mt-2"
              placeholder="Comentarios..."
              value={exam.psych.comments || ''}
              onChange={(e) => updateExam({ psych: { ...exam.psych, comments: e.target.value } })}
            />
          </div>
        </div>

        {/* GENITOURINARIO (MASCULINO / FEMENINO / NO EVALUADO) */}
        <div className="genitourinary-panel mt-4">
          <div className="panel-title-row">
            <h4 className="system-exam-title">Aparato Genitourinario</h4>
            <div className="radio-group-container">
              <label className={`radio-pill ${exam.genitourinary.examType === 'not_examined' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="genitourinaryType"
                  value="not_examined"
                  checked={exam.genitourinary.examType === 'not_examined'}
                  onChange={() => updateExam({ genitourinary: { ...exam.genitourinary, examType: 'not_examined' } })}
                />
                Diferido / No evaluado
              </label>
              <label className={`radio-pill ${exam.genitourinary.examType === 'male' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="genitourinaryType"
                  value="male"
                  checked={exam.genitourinary.examType === 'male'}
                  onChange={() => updateExam({ genitourinary: { ...exam.genitourinary, examType: 'male' } })}
                />
                Examen Masculino
              </label>
              <label className={`radio-pill ${exam.genitourinary.examType === 'female' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="genitourinaryType"
                  value="female"
                  checked={exam.genitourinary.examType === 'female'}
                  onChange={() => updateExam({ genitourinary: { ...exam.genitourinary, examType: 'female' } })}
                />
                Examen Femenino
              </label>
            </div>
          </div>

          {exam.genitourinary.examType === 'male' && (
            <div className="exam-checkboxes-stack mt-3 animate-slide-down">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.genitourinary.male?.nlScrotumNoMasses || false}
                  onChange={(e) => updateExam({
                    genitourinary: {
                      ...exam.genitourinary,
                      male: { ...exam.genitourinary.male!, nlScrotumNoMasses: e.target.checked }
                    }
                  })}
                />
                Escroto normal; sin dolor ni masas
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.genitourinary.male?.nlPenis || false}
                  onChange={(e) => updateExam({
                    genitourinary: {
                      ...exam.genitourinary,
                      male: { ...exam.genitourinary.male!, nlPenis: e.target.checked }
                    }
                  })}
                />
                Pene normal, sin lesiones cutaneomucosas ni secreción
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.genitourinary.male?.nlDigitalRectalProstate || false}
                  onChange={(e) => updateExam({
                    genitourinary: {
                      ...exam.genitourinary,
                      male: { ...exam.genitourinary.male!, nlDigitalRectalProstate: e.target.checked }
                    }
                  })}
                />
                Tacto rectal de próstata normal (tamaño y consistencia)
              </label>
            </div>
          )}

          {exam.genitourinary.examType === 'female' && (
            <div className="exam-checkboxes-stack mt-3 animate-slide-down">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.genitourinary.female?.nlExternalGenitaliaVagina || false}
                  onChange={(e) => updateExam({
                    genitourinary: {
                      ...exam.genitourinary,
                      female: { ...exam.genitourinary.female!, nlExternalGenitaliaVagina: e.target.checked }
                    }
                  })}
                />
                Genitales externos y vagina normales
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.genitourinary.female?.noUrethralTenderness || false}
                  onChange={(e) => updateExam({
                    genitourinary: {
                      ...exam.genitourinary,
                      female: { ...exam.genitourinary.female!, noUrethralTenderness: e.target.checked }
                    }
                  })}
                />
                Sin dolor a la palpación uretral
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.genitourinary.female?.nlBladderNoMasses || false}
                  onChange={(e) => updateExam({
                    genitourinary: {
                      ...exam.genitourinary,
                      female: { ...exam.genitourinary.female!, nlBladderNoMasses: e.target.checked }
                    }
                  })}
                />
                Vejiga urinaria normal, sin masas ni dolor
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.genitourinary.female?.nlCervixNoLesionsDischarges || false}
                  onChange={(e) => updateExam({
                    genitourinary: {
                      ...exam.genitourinary,
                      female: { ...exam.genitourinary.female!, nlCervixNoLesionsDischarges: e.target.checked }
                    }
                  })}
                />
                Cérvix normal, sin lesiones ni flujos/descargas
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.genitourinary.female?.nlUterus || false}
                  onChange={(e) => updateExam({
                    genitourinary: {
                      ...exam.genitourinary,
                      female: { ...exam.genitourinary.female!, nlUterus: e.target.checked }
                    }
                  })}
                />
                Útero en posición y tamaño normales
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exam.genitourinary.female?.nlAdnexaParametria || false}
                  onChange={(e) => updateExam({
                    genitourinary: {
                      ...exam.genitourinary,
                      female: { ...exam.genitourinary.female!, nlAdnexaParametria: e.target.checked }
                    }
                  })}
                />
                Anejos y parametrios libres, no dolorosos
              </label>
            </div>
          )}
        </div>

        {/* DETALLE Y SINTESIS DE HALLAZGOS ANORMALES */}
        <div className="sub-panel mt-4">
          <div className="panel-title-row">
            <h3 className="panel-title">Detalle de Hallazgos Físicos Relevantes / Anormales</h3>
          </div>

          <Select2Search
            category="hallazgo_examen"
            placeholder="Buscar o agregar hallazgos semiológicos destacados..."
            isMulti={false}
            onChangeSingle={(val) => {
              const current = exam.abnormalFindingsSummary || '';
              const separator = current.trim().length > 0 ? '; ' : '';
              updateExam({ abnormalFindingsSummary: `${current}${separator}${val}` });
            }}
            helperText="Seleccione hallazgos para anexarlos al texto descriptivo o redacte libremente abajo."
          />

          <div className="form-group mt-2">
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describa semiológicamente los hallazgos positivos encontrados durante la exploración..."
              value={exam.abnormalFindingsSummary || ''}
              onChange={(e) => updateExam({ abnormalFindingsSummary: e.target.value })}
            ></textarea>
          </div>
        </div>
      </div>

      {/* BARRA DE NAVEGACION INFERIOR */}
      <div className="step-actions-footer">
        <button
          type="button"
          className="btn-secondary"
          onClick={onPrev}
        >
          ← Volver a Etapa 1: Historia
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={onNext}
        >
          Continuar a Etapa 3: Datos y Plan →
        </button>
      </div>
    </div>
  );
};
