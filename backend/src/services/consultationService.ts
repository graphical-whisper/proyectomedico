import { ConsultationRepository } from '../repositories/consultationRepository.js';
import { InpatientConsultation, MedicalEvolution } from '../types/index.js';

export class ConsultationService {
  private consultRepo: ConsultationRepository;

  constructor(consultRepo?: ConsultationRepository) {
    this.consultRepo = consultRepo || new ConsultationRepository();
  }

  async createConsultation(data: Partial<InpatientConsultation | MedicalEvolution>): Promise<InpatientConsultation | MedicalEvolution> {
    if (!data.patientName || data.patientName.trim().length === 0) {
      throw new Error('El nombre del paciente es obligatorio.');
    }
    if (!data.date) {
      throw new Error('La fecha de la atencion es obligatoria.');
    }
    if (!data.time) {
      throw new Error('La hora de la atencion es obligatoria.');
    }
    if (!data.visitType) {
      throw new Error('Debe especificar si corresponde a Visita Inicial, Interconsulta o Evolucion Medica.');
    }

    const consultationToSave = data as InpatientConsultation;
    return await this.consultRepo.create(consultationToSave);
  }

  async getConsultationById(id: string): Promise<InpatientConsultation | null> {
    return await this.consultRepo.findById(id);
  }

  async getRecentConsultations(limit: number = 20): Promise<InpatientConsultation[]> {
    return await this.consultRepo.findAll(limit);
  }

  generateClinicalSummaryText(c: any): string {
    const lines: string[] = [];

    // Formato si es EVOLUCION MEDICA (SOAP)
    if (c.visitType === 'evolution') {
      const evo = c as MedicalEvolution;
      lines.push(`========================================================================`);
      lines.push(`CONSULTORIO MEDICO DR. OSCAR RUEDA OCHOA`);
      lines.push(`NOTA DE EVOLUCION MEDICA (CONTROL CLINICO)`);
      lines.push(`========================================================================`);
      lines.push(`Paciente: ${evo.patientName} | Identificacion: ${evo.patientIdNumber || 'N/A'} | Edad: ${evo.age || 'N/A'}`);
      lines.push(`Entidad: ${evo.entity || 'Particular'} | Sexo: ${evo.biologicalSex === 'F' ? 'Femenino' : evo.biologicalSex === 'M' ? 'Masculino' : 'N/A'}`);
      lines.push(`Fecha: ${evo.date} | Hora: ${evo.time}`);
      lines.push(``);
      lines.push(`--- IMPRESION DIAGNOSTICA ---`);
      if (evo.diagnosticImpressions && evo.diagnosticImpressions.length > 0) {
        evo.diagnosticImpressions.forEach((dx, i) => {
          lines.push(`${i + 1}- ${dx}`);
        });
      } else {
        lines.push(`1- En seguimiento clinico`);
      }
      lines.push(``);
      lines.push(`--- SUBJETIVO (S) ---`);
      lines.push(evo.subjective || 'Sin sintomas de alarma referidos por el paciente');
      lines.push(``);
      lines.push(`--- OBJETIVO (O) ---`);
      const v = evo.objective?.vitals;
      if (v) {
        lines.push(`Signos Vitales: Peso: ${v.weight || '--'} kg | Talla: ${v.height || '--'} m | TA: ${v.bloodPressure || '--'} mmHg | FC: ${v.pulse || '--'} lpm | FR: ${v.respiratoryRate || '--'} rpm | T: ${v.temperature || 'afebril'}`);
      }
      if (evo.objective?.physicalExamNarrative) {
        lines.push(`Examen Fisico: ${evo.objective.physicalExamNarrative}`);
      }
      if (evo.objective?.laboratoryResults && evo.objective.laboratoryResults.length > 0) {
        lines.push(`Estudios Paraclinicos y Laboratorios Traidos:`);
        evo.objective.laboratoryResults.forEach(lab => {
          lines.push(`• ${lab.testName}${lab.testCode ? ` (CUPS: ${lab.testCode})` : ''}: ${lab.result} ${lab.unit || ''} ${lab.reference ? `[Ref: ${lab.reference}]` : ''}`);
        });
      }
      lines.push(``);
      lines.push(`--- ANALISIS (A) ---`);
      lines.push(evo.analysis || 'Evolucion clinica segun lo esperado');
      lines.push(``);
      lines.push(`--- PLAN (P) ---`);
      if (evo.plan?.medicalConduct) {
        lines.push(`Conducta Medica: ${evo.plan.medicalConduct}`);
      }
      if (evo.plan?.prescriptions && evo.plan.prescriptions.length > 0) {
        lines.push(`Prescripcion Farmacologica:`);
        evo.plan.prescriptions.forEach((rx, idx) => {
          lines.push(`  ${idx + 1}. ${rx.drug} - ${rx.dose}: ${rx.instructions}`);
        });
      }
      if (evo.plan?.requestedExams && evo.plan.requestedExams.length > 0) {
        lines.push(`Solicitud de Laboratorios e Imagenes (SS):`);
        evo.plan.requestedExams.forEach(ex => {
          lines.push(`  • ${ex.testName}${ex.testCode ? ` (CUPS: ${ex.testCode})` : ''}${ex.notes ? ` - ${ex.notes}` : ''}`);
        });
      }
      if (evo.plan?.nextControl) {
        lines.push(`Proximo Control: ${evo.plan.nextControl}`);
      }
      if (evo.plan?.referrals) {
        lines.push(`Interconsultas / Remisiones: ${evo.plan.referrals}`);
      }
      lines.push(``);
      lines.push(`Medico Tratante: ${evo.attendingDoctorSignature || 'Dr. Oscar Leonel Rueda Ochoa'}`);
      lines.push(`========================================================================`);
      return lines.join('\n');
    }

    // Formato HISTORIA CLINICA DE PRIMERA VEZ / INTERCONSULTA
    const tipo = c.visitType === 'consult' ? `INTERCONSULTA (Solicitante: ${c.requestingPhysician || 'No especificado'})` : 'VISITA INICIAL / CONSULTA COMPLETA';
    lines.push(`========================================================================`);
    lines.push(`CONSULTORIO MEDICO DR. OSCAR RUEDA OCHOA`);
    lines.push(`NOTA DE ${tipo}`);
    lines.push(`========================================================================`);
    lines.push(`Paciente: ${c.patientName} | Documento/Historia: ${c.patientIdNumber || 'N/A'} | Edad: ${c.age || 'N/A'}`);
    lines.push(`Entidad: ${c.entity || 'Particular'} | Sexo: ${c.biologicalSex === 'F' ? 'Femenino' : c.biologicalSex === 'M' ? 'Masculino' : 'N/A'} | Procedencia: ${c.originCity || 'Bucaramanga'}`);
    lines.push(`Fecha: ${c.date} | Hora: ${c.time}`);
    lines.push(``);
    lines.push(`--- ALERGIAS Y MEDICACION HABITUAL ---`);
    lines.push(`Alergias: ${c.nkda ? 'Sin alergias medicamentosas conocidas (NKDA)' : (c.allergiesList?.join(', ') || 'Sin especificar')}`);
    lines.push(`Medicacion activa: ${c.medicationsList?.length ? c.medicationsList.join('; ') : 'Ninguna registrada'}`);
    lines.push(`Venta libre (OTC): ${c.otcMeds ? 'Si' : 'No'} | Suplementos: ${c.supplements ? 'Si' : 'No'}`);
    lines.push(`Conciliacion domiciliaria considerada: ${c.homeMedsConsidered ? 'Si' : 'No'}`);
    lines.push(``);
    lines.push(`--- ENFERMEDAD ACTUAL (HPI) ---`);
    lines.push(`Motivo de consulta: ${c.chiefComplaint || 'No especificado'}`);
    if (c.hpiUnableToObtain) {
      lines.push(`* No fue posible obtener historia clínica completa: ${c.hpiUnableReason || 'Causa no especificada'}`);
    } else {
      if (c.hpiLocation) lines.push(`- Localizacion: ${c.hpiLocation}`);
      if (c.hpiQuality) lines.push(`- Calidad / Caracter: ${c.hpiQuality}`);
      if (c.hpiDuration) lines.push(`- Duracion: ${c.hpiDuration}`);
      if (c.hpiTiming) lines.push(`- Temporalidad: ${c.hpiTiming}`);
      if (c.hpiSeverity) lines.push(`- Severidad / Escala: ${c.hpiSeverity}`);
      if (c.hpiContext) lines.push(`- Contexto: ${c.hpiContext}`);
      if (c.hpiModifyingFactors) lines.push(`- Factores modificadores: ${c.hpiModifyingFactors}`);
      if (c.hpiAssociatedSymptoms) lines.push(`- Signos y sintomas asociados: ${c.hpiAssociatedSymptoms}`);
      if (c.hpiNarrative) lines.push(`- Relato cronologico: ${c.hpiNarrative}`);
    }
    lines.push(``);
    lines.push(`--- ANTECEDENTES CLINICOS ---`);
    const pms = c.pastMedicalSurgical;
    if (pms?.fixedPathologies) {
      const fp = pms.fixedPathologies;
      const listFp: string[] = [];
      if (fp.htaCronica) listFp.push('HTA cronica');
      if (fp.hipoTa) listFp.push('Hipotension');
      if (fp.dmnid) listFp.push('DMNID (Diabetes)');
      if (fp.hipoglicemia) listFp.push('Hipoglicemia');
      if (fp.dislipidemia) listFp.push('Dislipidemia');
      if (fp.problemasTiroides) listFp.push('Problemas tiroideos');
      if (fp.asma) listFp.push('Asma');
      if (fp.epoc) listFp.push('EPOC');
      if (fp.erc) listFp.push('ERC');
      if (fp.cardiopatiaIsquemica) listFp.push('Cardiopatia isquemica');
      if (fp.obesidad) listFp.push('Obesidad');
      if (fp.cancer) listFp.push('Cancer');
      lines.push(`Patologicos confirmados: ${listFp.length > 0 ? listFp.join(', ') : 'Ninguno de la lista fija'}`);
    }
    if (pms?.conditions?.length) {
      lines.push(`Otros patologicos: ${pms.conditions.join(', ')}`);
    }
    if (pms?.surgicalHistory) lines.push(`Quirurgicos: ${pms.surgicalHistory}`);
    if (pms?.toxicHistory) lines.push(`Toxicos: ${pms.toxicHistory}`);
    if (pms?.traumaticHistory) lines.push(`Traumaticos: ${pms.traumaticHistory}`);
    if (pms?.hospitalHistory) lines.push(`Hospitalarios: ${pms.hospitalHistory}`);
    if (pms?.transfusionHistory) {
      lines.push(`Transfusionales: ${pms.transfusionHistory.hasTransfusions ? 'Si' : 'No'} | Grupo y Rh: ${pms.transfusionHistory.bloodType || 'No determinado'}${pms.transfusionHistory.details ? ` (${pms.transfusionHistory.details})` : ''}`);
    }
    if (pms?.pharmacologicalHistory) lines.push(`Farmacologicos previos: ${pms.pharmacologicalHistory}`);
    
    // Ginecologicos si aplica
    if (c.gynecologicalHistory && c.gynecologicalHistory.applicable) {
      const g = c.gynecologicalHistory;
      lines.push(`Ginecologicos: G: ${g.gravidity || 0} P: ${g.parity || 0} A: ${g.abortions || 0} V: ${g.livingChildren || 0} | FUR: ${g.lastMenstrualPeriod || 'No refiere'} | Ciclos: ${g.cycleType || 'R'} (${g.cycleDuration || '--'} dias) | Planificacion: ${g.isFamilyPlanning ? `Si (${g.familyPlanningMethod})` : 'No'}`);
    }

    // Habitos
    const s = c.socialHistory;
    if (s) {
      const t = s.tobacco;
      const al = s.alcohol;
      const ps = s.psychoactive;
      lines.push(`Habitos: Tabaco: ${t?.uses ? `Si (${t.frequency || ''} - ${t.productType || ''} ${t.packYears ? `IPA: ${t.packYears}` : ''})` : 'No'} | Alcohol: ${al?.uses ? `Si (${al.frequency || ''} - ${al.beverageType || ''})` : 'No'} | Sustancias: ${ps?.uses ? `Si (${ps.substance || ''} ${ps.frequency || ''})` : 'No'} | Parejas sexuales: ${s.sexualPartnersCount || 'No refiere'}`);
    }

    // Familiares
    const fam = c.familyHistory;
    if (fam) {
      const famLines: string[] = [];
      if (fam.parents?.diseases?.length || fam.parents?.details) {
        famLines.push(`Padres: ${[...(fam.parents.diseases || []), fam.parents.details].filter(Boolean).join('; ')}`);
      }
      if (fam.siblings?.diseases?.length || fam.siblings?.details) {
        famLines.push(`Hermanos: ${[...(fam.siblings.diseases || []), fam.siblings.details].filter(Boolean).join('; ')}`);
      }
      if (fam.grandparents?.diseases?.length || fam.grandparents?.details) {
        famLines.push(`Abuelos: ${[...(fam.grandparents.diseases || []), fam.grandparents.details].filter(Boolean).join('; ')}`);
      }
      lines.push(`Familiares: ${famLines.length > 0 ? famLines.join(' | ') : 'Sin antecedentes familiares reportados'}`);
    }

    lines.push(``);
    lines.push(`--- EXAMEN FISICO ---`);
    const v = c.physicalExam?.vitals;
    lines.push(`Signos vitales: T: ${v?.temperature || '--'} C | Pulso: ${v?.pulse || '--'} lpm (${v?.pulseRhythm || 'reg'}) | PA: ${v?.bloodPressure || '--'} mmHg (${v?.bpPosition || 'sentado'}) | FR: ${v?.respiratoryRate || '--'} rpm | Peso: ${v?.weight || '--'} kg | Talla: ${v?.height || '--'} m`);
    if (c.physicalExam?.appearance) lines.push(`Aspecto general: ${c.physicalExam.appearance}`);
    if (c.physicalExam?.abnormalFindingsSummary) lines.push(`Hallazgos anormales: ${c.physicalExam.abnormalFindingsSummary}`);
    lines.push(``);
    lines.push(`--- REVISION DE DATOS Y PLAN ---`);
    lines.push(`Estudios y paraclinicos: ${c.dataReview || 'Pendientes / Sin registrar'}`);
    lines.push(`Diagnosticos: ${c.diagnosesList?.join('; ') || 'En estudio'}`);
    if (c.requestedExams && c.requestedExams.length > 0) {
      lines.push(`Examenes solicitados (SS): ${c.requestedExams.map((e: any) => `${e.testName}${e.testCode ? ` (CUPS: ${e.testCode})` : ''}`).join(', ')}`);
    }
    lines.push(`Evaluacion y Plan: ${c.assessmentPlan || 'Continuar observacion'}`);
    lines.push(``);
    lines.push(`Firma del Evaluador: ${c.residentSignature || 'Dr. Oscar Leonel Rueda Ochoa'} | Fecha: ${c.residentDate || c.date} | Hora: ${c.residentTime || c.time}`);
    lines.push(`========================================================================`);

    return lines.join('\n');
  }
}
