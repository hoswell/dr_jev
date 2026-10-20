import type {
  GameEvent,
  GameStateSnapshot,
  IGameStateNode,
} from '../IGameStateNode';
import { AwaitingPatientInputState } from './AwaitingPatientInputState';

export class PatientEnteringState implements IGameStateNode {
  public readonly id = 'PATIENT_ENTERING' as const;
  public readonly label = 'Patient Entering';
  public readonly canTypeAnswer = false;
  public readonly canAdvanceDialogue = true;
  public readonly advanceButtonLabel = 'Begin Consultation →';

  public handleEvent(
    snapshot: GameStateSnapshot,
    event: GameEvent
  ): { nextState: IGameStateNode; nextSnapshot: GameStateSnapshot } {
    if (event.type === 'BEGIN_CONSULTATION') {
      const nextState = new AwaitingPatientInputState();
      return {
        nextState,
        nextSnapshot: {
          ...snapshot,
          stateId: nextState.id,
          stateLabel: nextState.label,
          canTypeAnswer: nextState.canTypeAnswer,
          canAdvanceDialogue: nextState.canAdvanceDialogue,
          advanceButtonLabel: nextState.advanceButtonLabel,
          speaker: 'Dr. Jev',
          dialogueText: snapshot.patientCase.currentQuestionText,
        },
      };
    }

    return { nextState: this, nextSnapshot: snapshot };
  }
}

