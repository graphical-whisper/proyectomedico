import { useState, useEffect } from 'react';
import { InpatientConsultation } from './types/consultation.js';
import { WizardProgress } from './components/WizardProgress.js';
import { Step1GeneralHistory } from './components/Step1GeneralHistory.js';
import { Step2PhysicalExam } from './components/Step2PhysicalExam.js';
import { Step3Plan } from './components/Step3Plan.js';
import { PrintableSummary } from './components/PrintableSummary.js';
import { saveConsultation, previewSummary, checkServerHealth } from './services/api.js';

const LOCAL_STORAGE_KEY = 'inpatient_consult_draft_v1';

function getInitialFormState(): InpatientConsultation {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  // Verificar si hay borrador previo en LocalStorage
  const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedDraft) {
    try {
      return JSON.parse(savedDraft);
    } catch {
      // Ignorar si hay error de parseo
    }
  }

  return {
    patientName: '',
    patientIdNumber: '',
    date: dateStr,
    time: timeStr,
    visitType: 'consult',
    requestingPhysician: '',

    nkda: false,
    allergiesList: [],
    otcMeds: false,
    supplements: false,
    medicationsList: [],
    homeMedsConsidered: true,

    chiefComplaint: '',
    hpiUnableToObtain: false,
    hpiUnableReason: '',
    hpiLocation: '',
    hpiQuality: '',
    hpiDuration: '',
    hpiTiming: '',
    hpiSeverity: '',
    hpiContext: '',
    hpiModifyingFactors: '',
    hpiAssociatedSymptoms: '',
    hpiNarrative: '',

    reviewOfSystems: {
      remainderNegative: true,
      unableToObtain: false,
      constitutional: { normal: true, comments: '' },
      eyes: { normal: true, comments: '' },
      ent: { normal: true, comments: '' },
      respiratory: { normal: true, comments: '' },
      cardiovascular: { normal: true, comments: '' },
      gastrointestinal: { normal: true, comments: '' },
      genitourinary: { normal: true, comments: '' },
      integumentary: { normal: true, comments: '' },
      musculoskeletal: { normal: true, comments: '' },
      neurologic: { normal: true, comments: '' },
      psychiatric: { normal: true, comments: '' },
      endocrinologic: { normal: true, comments: '' },
      hematologic: { normal: true, comments: '' },
      immunologic: { normal: true, comments: '' }
    },

    pastMedicalSurgical: {
      unableToObtain: false,
      nonContributory: false,
      conditions: [],
      surgicalHistory: ''
    },
    familyHistory: {
      unableToObtain: false,
      nonContributory: false,
      details: ''
    },
    socialHistory: {
      unableToObtain: false,
      nonContributory: false,
      etoh: false,
      tobaccoUse: false,
      ivda: false
    },

    physicalExam: {
      vitals: {
        temperature: '',
        pulse: '',
        pulseRhythm: 'regular',
        bloodPressure: '',
        bpPosition: 'sitting',
        respiratoryRate: '',
        weight: '',
        height: '',
        seeFlowSheet: false
      },
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
      genitourinary: {
        examType: 'not_examined',
        male: { nlScrotumNoMasses: false, nlPenis: false, nlDigitalRectalProstate: false, comments: '' },
        female: {
          nlExternalGenitaliaVagina: false,
          noUrethralTenderness: false,
          nlBladderNoMasses: false,
          nlCervixNoLesionsDischarges: false,
          nlUterus: false,
          nlAdnexaParametria: false,
          comments: ''
        }
      },
      abnormalFindingsSummary: ''
    },

    dataReview: '',
    diagnosesList: [],
    assessmentPlan: '',
    residentSignature: '',
    residentDate: dateStr,
    residentTime: timeStr
  };
}

export function App() {
  const [formData, setFormData] = useState<InpatientConsultation>(getInitialFormState);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [summaryPreviewText, setSummaryPreviewText] = useState<string>('');
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; status: string }>({ connected: false, status: 'verificando' });

  // Guardar en LocalStorage al modificar el formulario
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Verificar estado del backend al montar la aplicación
  useEffect(() => {
    checkServerHealth().then((res) => {
      setDbStatus({
        connected: res.databaseConnected,
        status: res.status
      });
    });
  }, []);

  const updateForm = (fields: Partial<InpatientConsultation>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields
    }));
  };

  const handleSaveToBackend = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    const result = await saveConsultation(formData);
    setIsSaving(false);

    if (result.success) {
      setSaveStatus({
        success: true,
        message: 'Nota clínica de consulta guardada exitosamente en PostgreSQL (ID: ' + (result.data?.id || 'OK') + ').'
      });
      if (result.summaryText) {
        setSummaryPreviewText(result.summaryText);
      }
    } else {
      setSaveStatus({
        success: false,
        message: 'Aviso al guardar: ' + result.error + '. (La información permanece protegida en su borrador local).'
      });
    }
  };

  const handleOpenPrintPreview = async () => {
    const text = await previewSummary(formData);
    setSummaryPreviewText(text);
    setShowPrintModal(true);
  };

  const handleCopyClipboard = async () => {
    const text = await previewSummary(formData);
    navigator.clipboard.writeText(text);
  };

  const handleResetForm = () => {
    if (window.confirm('¿Desea iniciar una nueva consulta en blanco? Los campos actuales se restablecerán.')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setFormData(getInitialFormState());
      setCurrentStep(1);
      setSaveStatus(null);
    }
  };

  return (
    <div className="app-wrapper">
      {/* BARRA SUPERIOR DE NAVEGACION */}
      <header className="top-navbar no-print">
        <div className="navbar-content">
          <div className="brand-section">
            <div className="brand-icon-box">Rx</div>
            <div>
              <h1 className="brand-title">Formulario Clínico de Interconsulta y Visita Hospitalaria</h1>
              <span className="brand-subtitle">Adaptación al español - Departamento de Medicina Hospitalaria</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="nav-status-badge">
              <span className={`status-dot ${dbStatus.connected ? 'online' : 'standby'}`}></span>
              <span>
                {dbStatus.connected ? 'PostgreSQL Activo' : 'Modo Contingencia Local'}
              </span>
            </div>

            <button
              type="button"
              className="btn-outline-secondary"
              onClick={handleResetForm}
              title="Limpiar formulario e iniciar nueva consulta"
            >
              Nueva Nota
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        {/* INDICADOR DE PROGRESO WIZARD */}
        <WizardProgress
          currentStep={currentStep}
          totalSteps={3}
          onSelectStep={(step) => setCurrentStep(step)}
        />

        {/* ETAPA 1: HISTORIA CLINICA */}
        {currentStep === 1 && (
          <Step1GeneralHistory
            formData={formData}
            updateForm={updateForm}
            onNext={() => {
              setCurrentStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* ETAPA 2: EXAMEN FISICO */}
        {currentStep === 2 && (
          <Step2PhysicalExam
            formData={formData}
            updateForm={updateForm}
            onNext={() => {
              setCurrentStep(3);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPrev={() => {
              setCurrentStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* ETAPA 3: DATOS, DIAGNOSTICO Y PLAN */}
        {currentStep === 3 && (
          <Step3Plan
            formData={formData}
            updateForm={updateForm}
            onPrev={() => {
              setCurrentStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSave={handleSaveToBackend}
            onOpenPrintPreview={handleOpenPrintPreview}
            onCopyClipboard={handleCopyClipboard}
            isSaving={isSaving}
            saveStatus={saveStatus}
          />
        )}
      </main>

      {/* MODAL DE IMPRESION CLINICA / REPORTE PDF */}
      {showPrintModal && (
        <PrintableSummary
          formData={formData}
          summaryText={summaryPreviewText}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}

export default App;
