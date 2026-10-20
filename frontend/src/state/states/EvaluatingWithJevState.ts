import type {
  GameEvent,
  GameStateSnapshot,
  IGameStateNode,
} from '../IGameStateNode';
import { AwaitingPatientInputState } from './AwaitingPatientInputState';
import { ConsultationCompleteState } from './ConsultationCompleteState';

export class EvaluatingWithJevState implements IGameStateNode {
  public readonly id = 'EVALUATING_WITH_JEV' as const;
  public readonly label = 'JEV Evaluating Answer';
  public readonly canTypeAnswer = false;
  public readonly canAdvanceDialogue = false;
  public readonly advanceButtonLabel = null;

  public handleEvent(
    snapshot: GameStateSnapshot,
    event: GameEvent
  ): { nextState: IGameStateNode; nextSnapshot: GameStateSnapshot } {
    if (event.type === 'JEV_RESPONSE_RECEIVED') {
      const updatedSession = snapshot.session.withPlayerId(event.playerId);
      const isFinalQuestion = snapshot.patientCase.isLastQuestion;

      if (isFinalQuestion) {
        const nextState = new ConsultationCompleteState();
        const completedPatientCase =
          snapshot.patientCase.withJudgementAndAdvance(event.judgement, false);

        return {
          nextState,
          nextSnapshot: {
            ...snapshot,
            stateId: nextState.id,
            stateLabel: nextState.label,
            canTypeAnswer: nextState.canTypeAnswer,
            canAdvanceDialogue: nextState.canAdvanceDialogue,
            advanceButtonLabel: nextState.advanceButtonLabel,
            session: updatedSession,
            patientCase: completedPatientCase,
            speaker: 'Dr. Jev',
            dialogueText: `${event.doctorReaction} All 5 questions complete! Review the final JEV assessment on the patient chart to the right.`,
          },
        };
      }

      const nextState = new AwaitingPatientInputState();
      const advancedPatientCase = snapshot.patientCase.withJudgementAndAdvance(
        event.judgement,
        true
      );

      return {
        nextState,
        nextSnapshot: {
          ...snapshot,
          stateId: nextState.id,
          stateLabel: nextState.label,
          canTypeAnswer: nextState.canTypeAnswer,
          canAdvanceDialogue: nextState.canAdvanceDialogue,
          advanceButtonLabel: nextState.advanceButtonLabel,
          session: updatedSession,
          patientCase: advancedPatientCase,
          speaker: 'Dr. Jev',
          dialogueText: advancedPatientCase.currentQuestionText,
        },
      };
    }

    return { nextState: this, nextSnapshot: snapshot };
  }
}

