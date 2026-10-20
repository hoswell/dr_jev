import { useGame } from '../../hooks/useGame';
import { DialogueHeader } from './DialogueHeader';
import { DialogueTextBox } from './DialogueTextBox';
import { PatientAnswerForm } from './PatientAnswerForm';

export function DialoguePanel() {
  const { snapshot, controller } = useGame();

  return (
    <footer className="vn-dialogue-panel">
      <DialogueHeader />
      <DialogueTextBox />

      <div className="vn-interaction-bar">
        {snapshot.canTypeAnswer ? (
          <PatientAnswerForm />
        ) : snapshot.canAdvanceDialogue ? (
          <div className="vn-advance-row">
            <button
              type="button"
              className="vn-advance-btn"
              onClick={controller.advanceConsultation}
            >
              {snapshot.advanceButtonLabel ?? 'Continue →'}
            </button>
          </div>
        ) : (
          <div className="vn-waiting-indicator">
            <span className="vn-spinner" /> Processing with Dr. Jev...
          </div>
        )}
      </div>
    </footer>
  );
}
