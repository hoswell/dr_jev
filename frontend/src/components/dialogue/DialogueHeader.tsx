import { useGame } from '../../hooks/useGame';

export function DialogueHeader() {
  const { snapshot } = useGame();
  const speakerClass = snapshot.speaker
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  return (
    <div className="vn-dialogue-header">
      <span className={`vn-speaker-badge speaker-${speakerClass}`}>
        {snapshot.speaker}
      </span>
      <div className="vn-status-pills">
        <span className="vn-state-pill">State: {snapshot.stateLabel}</span>
        <span className="vn-progress-pill">
          {snapshot.patientCase.progressLabel}
        </span>
      </div>
    </div>
  );
}
