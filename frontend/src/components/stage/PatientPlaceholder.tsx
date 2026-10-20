import { useGame } from '../../hooks/useGame';

export function PatientPlaceholder() {
  const { snapshot } = useGame();
  const isEntered = snapshot.stateId !== 'INIT_SESSION';
  const isKickedOut = Boolean(
    snapshot.stateId === 'CONSULTATION_COMPLETE' &&
      snapshot.patientCase.latestJudgement?.kickOutOffice
  );

  // Use randomized sprite assigned to this patient case (patient-01.png .. patient-20.png)
  const paddedIndex = String(snapshot.patientCase.spriteIndex).padStart(2, '0');
  const spriteSrc = `/patients/patient-${paddedIndex}.png`;

  let motionClass = 'patient-offscreen';
  if (isKickedOut) {
    motionClass = 'patient-kicked-out';
  } else if (isEntered) {
    motionClass = 'patient-entered';
  }

  return (
    <div
      key={`${snapshot.patientCase.patientId}-${snapshot.patientCase.spriteIndex}`}
      className={`character-slot patient-slot ${motionClass}`}
    >
      <img
        src={spriteSrc}
        alt={snapshot.patientCase.patientName}
        className="patient-sprite"
        draggable={false}
      />
    </div>
  );
}
