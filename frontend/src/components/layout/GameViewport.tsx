import { DialoguePanel } from '../dialogue/DialoguePanel';
import { PatientRecordPanel } from '../record/PatientRecordPanel';
import { CharacterStage } from '../stage/CharacterStage';
import { HospitalBackground } from './HospitalBackground';
import { TopHudBar } from './TopHudBar';

export function GameViewport() {
  return (
    <div className="game-viewport">
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

