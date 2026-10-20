import { useGame } from '../../hooks/useGame';

export function TopHudBar() {
  const { snapshot } = useGame();

  return (
    <header className="game-top-bar">
      <div className="brand-title">
        <span className="cross-icon">✚</span> DR. JEV CLINICAL DEMO
      </div>
      <div className="session-pill">
        Session ID: <strong>{snapshot.session.playerId ?? 'Requesting...'}</strong>
      </div>
    </header>
  );
}
