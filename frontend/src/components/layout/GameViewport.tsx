import { DialoguePanel } from '../dialogue/DialoguePanel';
import { PatientRecordPanel } from '../record/PatientRecordPanel';
import { CharacterStage } from '../stage/CharacterStage';
import { HospitalBackground } from './HospitalBackground';
import { TopHudBar } from './TopHudBar';
import { useGame } from '../../hooks/useGame';
import { isAmbulanceScene } from '../../state/IGameStateNode';

export function GameViewport() {
  const { snapshot } = useGame();
  return (
    <div className={`game-viewport${isAmbulanceScene(snapshot.stateId) ? ' game-viewport-ambulance' : ''}`}>
      <HospitalBackground />
      <TopHudBar />

      <div className="game-main-layout">
        <div className="visual-novel-column">
          <CharacterStage />
          <DialoguePanel />
        </div>

        <PatientRecordPanel />
      </div>
    </div>
  );
}

