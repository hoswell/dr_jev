import { useGame } from '../../hooks/useGame';

export function RecordHeader() {
  const { snapshot } = useGame();
  const { patientName, patientId } = snapshot.patientCase;
  const sessionId = snapshot.session.playerId;

  return (
    <div className="record-header">
      <div className="record-title-row">
        <h2>PATIENT RECORD</h2>
        <span className="jev-badge">DR. JEV LIVE</span>
      </div>
      <div className="record-meta">
        <div>
          <strong>Patient:</strong> {patientName} ({patientId})
        </div>
        <div>
          <strong>Session ID:</strong>{' '}
          <code>{sessionId ?? 'Initializing...'}</code>
        </div>
      </div>
    </div>
  );
}
