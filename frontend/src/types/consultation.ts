export type VisitType = 'initial_visit' | 'consult' | 'evolution';

export interface RosSystemEntry {
  normal: boolean;
  comments: string;
}

export interface ReviewOfSystems {
  remainderNegative: boolean;
  unableToObtain: boolean;
  unableReason?: string;
  constitutional: RosSystemEntry;
  eyes: RosSystemEntry;
  ent: RosSystemEntry;
  respiratory: RosSystemEntry;
  cardiovascular: RosSystemEntry;
  gastrointestinal: RosSystemEntry;
  genitourinary: RosSystemEntry;
  integumentary: RosSystemEntry;
  musculoskeletal: RosSystemEntry;
  neurologic: RosSystemEntry;
  psychiatric: RosSystemEntry;
  endocrinologic: RosSystemEntry;
  hematologic: RosSystemEntry;
  immunologic: RosSystemEntry;
}

export interface FixedPathologies {
  htaCronica: boolean;
  hipoTa: boolean;
  dmnid: boolean;
  hipoglicemia: boolean;
  dislipidemia: boolean;
  problemasTiroides: boolean;
  asma: boolean;
  epoc: boolean;
  erc: boolean;
  cardiopatiaIsquemica: boolean;
  obesidad: boolean;
  cancer: boolean;
}

export interface TransfusionHistory {
  hasTransfusions: boolean;
  bloodType: string;
  details?: string;
}

export interface PastMedicalSurgicalHistory {
  unableToObtain: boolean;
  unableReason?: string;
  nonContributory: boolean;
  fixedPathologies: FixedPathologies;
  conditions: string[]; // Otros antecedentes patológicos
  surgicalHistory: string;
  toxicHistory: string;
  traumaticHistory: string;
  hospitalHistory: string;
  transfusionHistory: TransfusionHistory;
  pharmacologicalHistory: string;
}

export interface FamilyHistoryGroup {
  diseases: string[];
  details: string;
}

export interface FamilyHistory {
  unableToObtain: boolean;
  nonContributory: boolean;
  parents: FamilyHistoryGroup;
  siblings: FamilyHistoryGroup;
  grandparents: FamilyHistoryGroup;
  details?: string;
}

export interface TobaccoHabit {
  uses: boolean;
  frequency: string;
  productType: string;
  packYears: string;
}

export interface AlcoholHabit {
  uses: boolean;
  frequency: string;
  beverageType: string;
}

export interface PsychoactiveHabit {
  uses: boolean;
  substance: string;
  frequency: string;
}

export interface SocialHistory {
  unableToObtain: boolean;
  nonContributory: boolean;
  tobacco: TobaccoHabit;
  alcohol: AlcoholHabit;
  psychoactive: PsychoactiveHabit;
  sexualPartnersCount: string;
  etoh?: boolean;
  tobaccoUse?: boolean;
  ivda?: boolean;
  occupation?: string;
  livingSituation?: string;
  otherNotes?: string;
}

export interface GynecologicalHistory {
  applicable: boolean;
  gravidity: number | '';
  parity: number | '';
  abortions: number | '';
  livingChildren: number | '';
  lastMenstrualPeriod: string;
  cycleType: 'R' | 'I' | '';
  cycleDuration: string;
  isFamilyPlanning: boolean;
  familyPlanningMethod: string;
}

export interface VitalSigns {
  temperature?: string;
  pulse?: string;
  pulseRhythm?: 'regular' | 'irregular';
  bloodPressure?: string;
  bpPosition?: 'sitting' | 'supine';
  respiratoryRate?: string;
  weight?: string;
  height?: string;
  seeFlowSheet: boolean;
}

export interface PhysicalExamSystems {
  vitals: VitalSigns;
  appearance?: string;
  eyes: {
    noScleralIcterus: boolean;
    perrla: boolean;
    nlFundusExam: boolean;
    comments?: string;
  };
  ent: {
    nlHearing: boolean;
    nlCanalsTympanic: boolean;
    nlTeethLipsGums: boolean;
    clearOropharynx: boolean;
    comments?: string;
  };
  neck: {
    nlAppearanceMovementsJvp: boolean;
    tracheaMidline: boolean;
    noThyroidEnlargementMasses: boolean;
    comments?: string;
  };
  respiratory: {
    symmetricalExpansion: boolean;
    clearAuscultationPalpation: boolean;
    nlPercussion: boolean;
    comments?: string;
  };
  breast: {
    nlSymmetry: boolean;
    noMassesTenderness: boolean;
    comments?: string;
  };
  cardiovascular: {
    nlSoundsNoMurmursGallopsRubs: boolean;
    noJvd: boolean;
    noCarotidBruits: boolean;
    nlPmiNoThrill: boolean;
    nlPulses: boolean;
    pulseFemoral: boolean;
    pulsePedal: boolean;
    pulseOther?: string;
    comments?: string;
  };
  abdominal: {
    noTendernessNlSounds: boolean;
    noHernias: boolean;
    noHepatosplenomegaly: boolean;
    nlDigitalRectalExam: boolean;
    negHemoccult: boolean;
    comments?: string;
  };
  lymphatic: {
    noAdenopathy: boolean;
    noAdenopathyCervical: boolean;
    noAdenopathySupraclavicular: boolean;
    noAdenopathyAxillary: boolean;
    noAdenopathyInguinal: boolean;
    comments?: string;
  };
  musculoskeletal: {
    nlGait: boolean;
    noClubbingCyanosis: boolean;
    nlSymmetryRomStrengthTone: boolean;
    comments?: string;
  };
  skin: {
    noRashesUlcers: boolean;
    noNodules: boolean;
    comments?: string;
  };
  neuro: {
    nlCranialNerves: boolean;
    nlReflexes: boolean;
    nlSensation: boolean;
    comments?: string;
  };
  psych: {
    alertOrientedPersonPlaceTime: boolean;
    intactMemory: boolean;
    nlAffectJudgementInsight: boolean;
    comments?: string;
  };
  genitourinary: {
    examType: 'male' | 'female' | 'not_examined';
    male?: {
      nlScrotumNoMasses: boolean;
      nlPenis: boolean;
      nlDigitalRectalProstate: boolean;
      comments?: string;
    };
    female?: {
      nlExternalGenitaliaVagina: boolean;
      noUrethralTenderness: boolean;
      nlBladderNoMasses: boolean;
      nlCervixNoLesionsDischarges: boolean;
      nlUterus: boolean;
      nlAdnexaParametria: boolean;
      comments?: string;
    };
  };
  abnormalFindingsSummary?: string;
}

export interface RequestedExam {
  testName: string;
  testCode?: string;
  notes?: string;
}

export interface InpatientConsultation {
  id?: string;
  patientName: string;
  patientIdNumber?: string;
  age?: string;
  biologicalSex?: 'M' | 'F';
  entity?: string;
  originCity?: string;
  occupation?: string;
  date: string;
  time: string;
  visitType: VisitType;
  requestingPhysician?: string;
  
  // Alergias y Medicamentos
  nkda: boolean;
  allergiesList: string[];
  otcMeds: boolean;
  supplements: boolean;
  medicationsList: string[];
  homeMedsConsidered: boolean;

  // Motivo de Consulta y HPI
  chiefComplaint: string;
  hpiUnableToObtain: boolean;
  hpiUnableReason?: string;
  hpiLocation?: string;
  hpiQuality?: string;
  hpiDuration?: string;
  hpiTiming?: string;
  hpiSeverity?: string;
  hpiContext?: string;
  hpiModifyingFactors?: string;
  hpiAssociatedSymptoms?: string;
  hpiNarrative?: string;

  // Revision por Sistemas (ROS)
  reviewOfSystems: ReviewOfSystems;

  // Antecedentes fusionados
  pastMedicalSurgical: PastMedicalSurgicalHistory;
  gynecologicalHistory?: GynecologicalHistory;
  familyHistory: FamilyHistory;
  socialHistory: SocialHistory;

  // Examen Fisico
  physicalExam: PhysicalExamSystems;

  // Datos y Plan
  dataReview: string;
  diagnosesList: string[];
  requestedExams?: RequestedExam[];
  assessmentPlan: string;
  residentSignature: string;
  residentDate: string;
  residentTime: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface LaboratoryResultEntry {
  testName: string;
  testCode?: string;
  result: string;
  unit?: string;
  reference?: string;
}

export interface MedicalEvolution {
  id?: string;
  patientName: string;
  patientIdNumber?: string;
  age?: string;
  biologicalSex?: 'M' | 'F';
  entity?: string;
  date: string;
  time: string;
  visitType: 'evolution';
  
  // Impresión Diagnóstica Priorizada (1, 2, 3...)
  diagnosticImpressions: string[];

  // Formato SOAP
  subjective: string; // S: Sintomas, mejoria, adherencia farmacologica
  objective: {
    vitals: VitalSigns;
    physicalExamNarrative: string;
    laboratoryResults: LaboratoryResultEntry[];
  }; // O: Examen fisico y laboratorios traidos
  analysis: string; // A: Juicio clinico
  plan: {
    medicalConduct: string;
    prescriptions: { drug: string; dose: string; instructions: string }[];
    requestedExams: RequestedExam[];
    nextControl?: string;
    referrals?: string;
  }; // P: Conducta, recetas, solicitudes paraclínicos

  attendingDoctorSignature: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogItem {
  id: string;
  category: 'alergia' | 'medicamento' | 'diagnostico' | 'motivo_consulta' | 'antecedente' | 'hallazgo_examen' | 'examen';
  code?: string;
  name: string;
  description?: string;
  frequency?: number;
}
