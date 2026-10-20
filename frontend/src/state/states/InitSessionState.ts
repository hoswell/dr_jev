import type {
  GameEvent,
  GameStateSnapshot,
  IGameStateNode,
} from '../IGameStateNode';
import { PatientEnteringState } from './PatientEnteringState';

export class InitSessionState implements IGameStateNode {
  public readonly id = 'INIT_SESSION' as const;
  public readonly label = 'Initializing Session';
  public readonly canTypeAnswer = false;
  public readonly canAdvanceDialogue = false;
  public readonly advanceButtonLabel = null;

  public handleEvent(
    snapshot: GameStateSnapshot,
    event: GameEvent
  ): { nextState: IGameStateNode; nextSnapshot: GameStateSnapshot } {
    if (event.type === 'SESSION_INITIALIZED') {
      const nextState = new PatientEnteringState();
      const updatedSession = snapshot.session.withPlayerId(event.playerId);
      const updatedPatientCase = event.questions
        ? snapshot.patientCase.withQuestions(event.questions)
        : snapshot.patientCase;

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
          patientCase: updatedPatientCase,
          speaker: 'Dr. Jev',
          dialogueText: "Welcome to Dr. Jev's Clinic! Send in the first patient!",
          error: null,
        },
      };
    }

    if (event.type === 'SESSION_ERROR') {
      return {
        nextState: this,
        nextSnapshot: {
          ...snapshot,
          error: event.error,
          dialogueText: `Connection error: ${event.error}`,
        },
      };
    }

    return { nextState: this, nextSnapshot: snapshot };
  }
}
