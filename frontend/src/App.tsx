import { useState, useEffect } from 'react';
import { InpatientConsultation, MedicalEvolution } from './types/consultation.js';
import { WizardProgress } from './components/WizardProgress.js';
import { Step1GeneralHistory } from './components/Step1GeneralHistory.js';
import { Step2PhysicalExam } from './components/Step2PhysicalExam.js';
import { Step3Plan } from './components/Step3Plan.js';
import { MedicalEvolutionWizard } from './components/MedicalEvolutionWizard.js';
import { PrintableSummary } from './components/PrintableSummary.js';
import { saveConsultation, previewSummary, checkServerHealth } from './services/api.js';

const LOCAL_STORAGE_CONSULT_KEY = 'inpatient_consult_draft_v2';
const LOCAL_STORAGE_EVOLUTION_KEY = 'medical_evolution_draft_v2';

function getInitialFormState(): InpatientConsultation {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  const savedDraft = localStorage.getItem(LOCAL_STORAGE_CONSULT_KEY);
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
    age: '',
    biologicalSex: 'M',
    entity: 'Particular',
    originCity: 'Bucaramanga',
    occupation: '',
    date: dateStr,
    time: timeStr,
    visitType: 'initial_visit',
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
      fixedPathologies: {
        htaCronica: false,
        hipoTa: false,
        dmnid: false,
        hipoglicemia: false,
        dislipidemia: false,
        problemasTiroides: false,
        asma: false,
        epoc: false,
        erc: false,
        cardiopatiaIsquemica: false,
        obesidad: false,
        cancer: false
      },
      conditions: [],
      surgicalHistory: '',
      toxicHistory: '',
      traumaticHistory: '',
      hospitalHistory: '',
      transfusionHistory: { hasTransfusions: false, bloodType: 'No determinado' },
      pharmacologicalHistory: ''
    },

    gynecologicalHistory: {
      applicable: false,
      gravidity: '',
      parity: '',
      abortions: '',
      livingChildren: '',
      lastMenstrualPeriod: '',
      cycleType: 'R',
      cycleDuration: '28',
      isFamilyPlanning: false,
      familyPlanningMethod: ''
    },

    familyHistory: {
      unableToObtain: false,
      nonContributory: false,
      parents: { diseases: [], details: '' },
      siblings: { diseases: [], details: '' },
      grandparents: { diseases: [], details: '' }
    },

    socialHistory: {
      unableToObtain: false,
      nonContributory: false,
      tobacco: { uses: false, frequency: '', productType: '', packYears: '' },
      alcohol: { uses: false, frequency: '', beverageType: '' },
      psychoactive: { uses: false, substance: '', frequency: '' },
      sexualPartnersCount: '',
      occupation: '',
      livingSituation: ''
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
    requestedExams: [],
    assessmentPlan: '',
    residentSignature: 'Dr. Oscar Leonel Rueda Ochoa - Esp. Medicina Interna',
    residentDate: dateStr,
    residentTime: timeStr
  };
}

function getInitialEvolutionState(): MedicalEvolution {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  const savedDraft = localStorage.getItem(LOCAL_STORAGE_EVOLUTION_KEY);
  if (savedDraft) {
    try {
      return JSON.parse(savedDraft);
    } catch {
      // Ignorar
    }
  }

  return {
    patientName: '',
    patientIdNumber: '',
    age: '',
    biologicalSex: 'M',
    entity: 'Particular',
    date: dateStr,
    time: timeStr,
    visitType: 'evolution',
    diagnosticImpressions: [],
    subjective: '',
    objective: {
      vitals: {
        weight: '',
        height: '',
        bloodPressure: '',
        pulse: '',
        respiratoryRate: '',
        temperature: 'afebril',
        seeFlowSheet: false
      },
      physicalExamNarrative: '',
      laboratoryResults: []
    },
    analysis: '',
    plan: {
      medicalConduct: '',
      prescriptions: [],
      requestedExams: [],
      nextControl: 'Control con resultados',
      referrals: ''
    },
    attendingDoctorSignature: 'Dr. Oscar Leonel Rueda Ochoa - Esp. Medicina Interna'
  };
}

export function App() {
  const [activeMode, setActiveMode] = useState<'consultation' | 'evolution'>('consultation');
  const [formData, setFormData] = useState<InpatientConsultation>(getInitialFormState);
  const [evolutionData, setEvolutionData] = useState<MedicalEvolution>(getInitialEvolutionState);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [summaryPreviewText, setSummaryPreviewText] = useState<string>('');
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; status: string }>({ connected: false, status: 'verificando' });

  // Guardar borradores en LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CONSULT_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_EVOLUTION_KEY, JSON.stringify(evolutionData));
  }, [evolutionData]);

  // Verificar estado del backend
  useEffect(() => {
    checkServerHealth().then((res) => {
      setDbStatus({
        connected: res.databaseConnected,
        status: res.status
      });
    });
  }, []);

  const updateForm = (fields: Partial<InpatientConsultation>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const updateEvolutionForm = (fields: Partial<MedicalEvolution>) => {
    setEvolutionData((prev) => ({ ...prev, ...fields }));
  };

  const handleSaveToBackend = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    const payload = activeMode === 'consultation' ? formData : evolutionData;
    const result = await saveConsultation(payload as any);
    setIsSaving(false);

    if (result.success) {
      const docType = activeMode === 'consultation' ? 'Consulta inicial' : 'Evolución médica (SOAP)';
      setSaveStatus({
        success: true,
        message: `${docType} guardada exitosamente en la base de datos (ID: ${result.data?.id || 'OK'}).`
      });
      if (result.summaryText) {
        setSummaryPreviewText(result.summaryText);
      }
    } else {
      setSaveStatus({
        success: false,
        message: 'Aviso al guardar: ' + result.error + '. (La información permanece en el borrador local).'
      });
    }
  };

  const handleOpenPrintPreview = async () => {
    const payload = activeMode === 'consultation' ? formData : evolutionData;
    const text = await previewSummary(payload as any);
    setSummaryPreviewText(text);
    setShowPrintModal(true);
  };

  const handleCopyClipboard = async () => {
    const payload = activeMode === 'consultation' ? formData : evolutionData;
    const text = await previewSummary(payload as any);
    navigator.clipboard.writeText(text);
  };

  const handleResetForm = () => {
    if (activeMode === 'consultation') {
      if (window.confirm('¿Desea restablecer el formulario de Consulta Inicial?')) {
        localStorage.removeItem(LOCAL_STORAGE_CONSULT_KEY);
        setFormData(getInitialFormState());
        setCurrentStep(1);
        setSaveStatus(null);
      }
    } else {
      if (window.confirm('¿Desea restablecer el formulario de Evolución Médica?')) {
        localStorage.removeItem(LOCAL_STORAGE_EVOLUTION_KEY);
        setEvolutionData(getInitialEvolutionState());
        setSaveStatus(null);
      }
    }
  };

  return (
    <div className="app-wrapper">
      {/* BARRA SUPERIOR DE NAVEGACION */}
      <header className="top-navbar no-print">
        <div className="navbar-content">
          <div className="brand-section">
            <div className="brand-icon-box">Dr</div>
            <div>
              <h1 className="brand-title">Dr. Oscar Leonel Rueda Ochoa</h1>
              <span className="brand-subtitle">Medicina Interna - Centro Médico Galileo</span>
            </div>
          </div>

          {/* SELECTOR DE MODO DUAL (Q4: Opción C) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', padding: '0.25rem', borderRadius: '8px' }}>
            <button
              type="button"
              className={`btn-pill-mode ${activeMode === 'consultation' ? 'active-mode' : ''}`}
              onClick={() => {
                setActiveMode('consultation');
                setCurrentStep(1);
                setSaveStatus(null);
              }}
              style={{
                background: activeMode === 'consultation' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Consulta de Primera Vez
            </button>

            <button
              type="button"
              className={`btn-pill-mode ${activeMode === 'evolution' ? 'active-mode' : ''}`}
              onClick={() => {
                setActiveMode('evolution');
                setSaveStatus(null);
              }}
              style={{
                background: activeMode === 'evolution' ? '#0d9488' : 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Evolución Médica (Control / SOAP)
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="nav-status-badge">
              <span className={`status-dot ${dbStatus.connected ? 'online' : 'standby'}`}></span>
              <span>
                {dbStatus.connected ? 'PostgreSQL Activo' : 'Modo Contingencia'}
              </span>
            </div>

            <button
              type="button"
              className="btn-outline-secondary"
              onClick={handleResetForm}
              title="Limpiar formulario actual"
            >
              Nueva Nota
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        {/* MODO 1: CONSULTA DE PRIMERA VEZ (WIZARD DE 3 PASOS) */}
        {activeMode === 'consultation' ? (
          <div>
            <WizardProgress
              currentStep={currentStep}
              totalSteps={3}
              onSelectStep={(step) => setCurrentStep(step)}
            />

            {/* ETAPA 1: HISTORIA CLINICA Y ANTECEDENTES */}
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

            {/* ETAPA 3: DATOS, DIAGNOSTICO, PLAN Y PORTAFOLIO DE EXAMENES */}
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
          </div>
        ) : (
          /* MODO 2: EVOLUCION MEDICA (SOAP WIZARD) */
          <MedicalEvolutionWizard
            formData={evolutionData}
            updateForm={updateEvolutionForm}
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
          formData={activeMode === 'consultation' ? formData : evolutionData}
          summaryText={summaryPreviewText}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}

export default App;
