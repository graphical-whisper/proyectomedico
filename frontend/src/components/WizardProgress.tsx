import React from 'react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  onSelectStep: (step: number) => void;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  totalSteps,
  onSelectStep
}) => {
  const steps = [
    {
      number: 1,
      title: 'Historia Clínica y General',
      subtitle: 'Datos de visita, Alergias, HPI, ROS, Antecedentes'
    },
    {
      number: 2,
      title: 'Examen Físico Multisistémico',
      subtitle: 'Signos vitales, Evaluación por aparatos y sistemas'
    },
    {
      number: 3,
      title: 'Datos, Diagnósticos y Plan',
      subtitle: 'Paraclínicos, CIE-10, Plan de manejo y Firmas'
    }
  ];

  const progressPercentage = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="wizard-progress-card">
      <div className="wizard-steps-container">
        {steps.map((s) => {
          const isActive = s.number === currentStep;
          const isCompleted = s.number < currentStep;

          return (
            <div
              key={s.number}
              className={`wizard-step-item ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}`}
              onClick={() => onSelectStep(s.number)}
              role="button"
              tabIndex={0}
            >
              <div className="wizard-step-circle">
                {isCompleted ? '✓' : s.number}
              </div>
              <div className="wizard-step-info">
                <span className="wizard-step-number">Etapa {s.number} de {totalSteps}</span>
                <span className="wizard-step-title">{s.title}</span>
                <span className="wizard-step-subtitle">{s.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="wizard-progress-bar-wrapper">
        <div
          className="wizard-progress-bar-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};
