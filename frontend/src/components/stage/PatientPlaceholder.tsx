import { useGame } from '../../hooks/useGame';

export function PatientPlaceholder() {
  const { snapshot } = useGame();
  const isEntered = snapshot.stateId !== 'INIT_SESSION';

  return (
    <div
      key={snapshot.patientCase.patientId}
      className={`character-slot patient-slot ${
        isEntered ? 'patient-entered' : 'patient-offscreen'
      }`}
    >
      <div className="character-rectangle patient-rectangle">
        <span className="rect-role">
          {snapshot.patientCase.patientName.toUpperCase()}
        </span>
        <span className="rect-sub">(Patient Placeholder)</span>
      </div>
    </div>
  );
}
