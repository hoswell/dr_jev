import { useGame } from '../../hooks/useGame';
import { isAmbulanceScene } from '../../state/IGameStateNode';

export function HospitalBackground() {
  const { snapshot } = useGame();
  const outside = isAmbulanceScene(snapshot.stateId);
  return (
    <div
      className={`hospital-background${outside ? ' hospital-background-outside' : ''}`}
      style={{ backgroundImage: `url('${outside ? '/clinic-outside.png' : '/hospital-bg.jpg'}')` }}
      aria-hidden="true"
    />
  );
}

