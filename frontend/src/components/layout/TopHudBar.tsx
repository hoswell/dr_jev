import { isAmbulancePreview } from '../../services/createBackendService';

export function TopHudBar() {
  return (
    <header className="game-top-bar">
      <div className="brand-title">
        <span className="cross-icon">✚</span> Dr. Jev's Clinic
      </div>
      {isAmbulancePreview() && (
        <span className="ambulance-preview-label">Ambulance preview · Simulated results</span>
      )}
    </header>
  );
}
