import { useGame } from '../../hooks/useGame';

export function PatientPlaceholder() {
  const { snapshot } = useGame();
  const isEntered = snapshot.stateId !== 'INIT_SESSION';

  // Cycle through the 20 patient sprites (patient-01.png .. patient-20.png)
  const spriteIndex = ((snapshot.patientCase.patientNumber - 1) % 20) + 1;
  const paddedIndex = String(spriteIndex).padStart(2, '0');
  const spriteSrc = `/patients/patient-${paddedIndex}.png`;

  return (
    <div
      key={snapshot.patientCase.patientId}
      className={`character-slot patient-slot ${
        isEntered ? 'patient-entered' : 'patient-offscreen'
      }`}
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
