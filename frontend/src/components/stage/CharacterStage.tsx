import { DoctorPlaceholder } from './DoctorPlaceholder';
import { PatientPlaceholder } from './PatientPlaceholder';
import { AmbulanceStage } from './AmbulanceStage';
import { useGame } from '../../hooks/useGame';
import { isAmbulanceScene } from '../../state/IGameStateNode';

export function CharacterStage() {
  const { snapshot } = useGame();
  if (isAmbulanceScene(snapshot.stateId)) return <AmbulanceStage />;
  return (
    <main className="character-stage">
      <DoctorPlaceholder />
      <PatientPlaceholder />
    </main>
  );
}

