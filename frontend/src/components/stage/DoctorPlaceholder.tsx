import { useGame } from '../../hooks/useGame';
import type { EmotionType } from '../../models/JevJudgementModel';
import type { GameStateSnapshot } from '../../state/IGameStateNode';

export type DoctorSpriteEmotion =
  | 'neutral'
  | 'thinking'
  | 'skeptical'
  | 'shocked'
  | 'happy';

const BACKEND_EMOTION_TO_SPRITE: Record<EmotionType, DoctorSpriteEmotion> = {
  calm: 'neutral',
  anxious: 'thinking',
  angry: 'skeptical',
  sad: 'thinking',
  afraid: 'shocked',
};

function resolveDoctorEmotion(
  snapshot: GameStateSnapshot
): DoctorSpriteEmotion {
  if (snapshot.stateId === 'EVALUATING_WITH_JEV') {
    return 'thinking';
  }

  const judgement = snapshot.patientCase.latestJudgement;

  if (snapshot.stateId === 'CONSULTATION_COMPLETE') {
    if (judgement?.kickOutOffice || judgement?.callAmbulance) {
      return 'shocked';
    }
    return 'happy';
  }

  if (!judgement) {
    return 'neutral';
  }

  if (judgement.callAmbulance || judgement.kickOutOffice) {
    return 'shocked';
  }

  if (judgement.isPatientLying) {
    return 'skeptical';
  }

  return BACKEND_EMOTION_TO_SPRITE[judgement.doctorEmotion] ?? 'neutral';
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
