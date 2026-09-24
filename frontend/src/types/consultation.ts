export type VisitType = 'initial_visit' | 'consult';

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

export interface PastMedicalSurgicalHistory {
  unableToObtain: boolean;
  unableReason?: string;
  nonContributory: boolean;
  conditions: string[];
  surgicalHistory: string;
}

export interface FamilyHistory {
  unableToObtain: boolean;
  nonContributory: boolean;
  details: string;
}

export interface SocialHistory {
  unableToObtain: boolean;
  nonContributory: boolean;
  etoh: boolean;
  etohDetails?: string;
  tobaccoUse: boolean;
  tobaccoPackYears?: string;
  ivda: boolean;
  ivdaLastUse?: string;
  occupation?: string;
  livingSituation?: string;
  otherNotes?: string;
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

export interface InpatientConsultation {
  id?: string;
  patientName: string;
  patientIdNumber?: string;
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

  // Antecedentes
  pastMedicalSurgical: PastMedicalSurgicalHistory;
  familyHistory: FamilyHistory;
  socialHistory: SocialHistory;

  // Examen Fisico
  physicalExam: PhysicalExamSystems;

  // Datos y Plan
  dataReview: string;
  diagnosesList: string[];
  assessmentPlan: string;
  residentSignature: string;
  residentDate: string;
  residentTime: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogItem {
  id: string;
  category: 'alergia' | 'medicamento' | 'diagnostico' | 'motivo_consulta' | 'antecedente' | 'hallazgo_examen';
  code?: string;
  name: string;
  description?: string;
  frequency?: number;
}
