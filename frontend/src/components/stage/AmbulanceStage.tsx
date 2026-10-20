import { useEffect } from 'react';
import { useGame } from '../../hooks/useGame';

const ARRIVAL_DURATION_MS = 3800;

export function AmbulanceStage() {
  const { snapshot, controller } = useGame();
  const waiting = snapshot.stateId === 'WAITING_FOR_AMBULANCE';

  // Keep the scene operable if animation events are disabled or never delivered.
  useEffect(() => {
    if (!waiting) return;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(controller.ambulanceArrived, reducedMotion ? 0 : ARRIVAL_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [controller, waiting]);

  return (
    <main className="ambulance-stage" aria-label="Outside the clinic, waiting for the ambulance">
      <div className="ambulance-scene-caption" role="status">
        <span className="ambulance-status-dot" aria-hidden="true" />
        {waiting ? 'Ambulance on its way' : 'Ambulance has arrived'}
      </div>
      <div
        className={`ambulance-vehicle ${waiting ? 'ambulance-vehicle-arriving' : ''}`}
        style={{ animationDuration: `${ARRIVAL_DURATION_MS}ms` }}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && waiting) {
            controller.ambulanceArrived();
          }
        }}
      >
        <img src="/ambulance.png" alt="Ambulance arriving outside the clinic" draggable={false} />
      </div>
    </main>
  );
}
