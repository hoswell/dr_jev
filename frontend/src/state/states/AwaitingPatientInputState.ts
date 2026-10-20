import type {
  GameEvent,
  GameStateSnapshot,
  IGameStateNode,
} from '../IGameStateNode';
import { EvaluatingWithJevState } from './EvaluatingWithJevState';

export class AwaitingPatientInputState implements IGameStateNode {
  public readonly id = 'AWAITING_PATIENT_INPUT' as const;
  public readonly label = 'Awaiting Patient Response';
  public readonly canTypeAnswer = true;
  public readonly canAdvanceDialogue = false;
  public readonly advanceButtonLabel = null;

  public handleEvent(
    snapshot: GameStateSnapshot,
    event: GameEvent
  ): { nextState: IGameStateNode; nextSnapshot: GameStateSnapshot } {
    if (event.type === 'SUBMIT_ANSWER') {
      const nextState = new EvaluatingWithJevState();
      const updatedPatientCase = snapshot.patientCase.withRecordedAnswer(
        event.answer
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
          patientCase: updatedPatientCase,
          speaker: 'Patient',
          dialogueText: `"${event.answer}" — (Sending response to Dr. Jev...)`,
        },
      };
    }

    return { nextState: this, nextSnapshot: snapshot };
  }
}

