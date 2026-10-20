import { useGame } from '../../hooks/useGame';
import type { GameStateSnapshot } from '../../state/IGameStateNode';

export type DoctorEmotion =
  | 'neutral'
  | 'thinking'
  | 'skeptical'
  | 'shocked'
  | 'happy';

function resolveDoctorEmotion(snapshot: GameStateSnapshot): DoctorEmotion {
  if (snapshot.stateId === 'EVALUATING_WITH_JEV') {
    return 'thinking';
  }
  if (snapshot.stateId === 'CONSULTATION_COMPLETE') {
    return 'happy';
  }

  const judgement = snapshot.patientCase.latestJudgement;
  if (!judgement) {
    return 'neutral';
  }

  if (
    judgement.callAmbulance ||
    judgement.criticality === 'Critical' ||
    judgement.criticality === 'High'
  ) {
    return 'shocked';
  }

  if (judgement.isPatientLying || !judgement.trustPatient) {
    return 'skeptical';
  }

  return 'neutral';
}

export function DoctorPlaceholder() {
  const { snapshot } = useGame();
  const emotion = resolveDoctorEmotion(snapshot);

  return (
    <div className="character-slot doctor-slot">
      <img
        src={`/dr-jev-${emotion}.png`}
        alt={`Dr. Jev (${emotion})`}
        className="doctor-sprite"
        draggable={false}
      />
    </div>
  );
}
