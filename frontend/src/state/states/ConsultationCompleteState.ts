import { PatientCaseModel } from '../../models/PatientCaseModel';
import type {
  GameEvent,
  GameStateSnapshot,
  IGameStateNode,
} from '../IGameStateNode';
import { PatientEnteringState } from './PatientEnteringState';

export class ConsultationCompleteState implements IGameStateNode {
  public readonly id = 'CONSULTATION_COMPLETE' as const;
  public readonly label = 'Consultation Complete';
  public readonly canTypeAnswer = false;
  public readonly canAdvanceDialogue = true;
  public readonly advanceButtonLabel = 'Call Next Patient →';

  public handleEvent(
    snapshot: GameStateSnapshot,
    event: GameEvent
  ): { nextState: IGameStateNode; nextSnapshot: GameStateSnapshot } {
    if (event.type === 'NEXT_PATIENT') {
      const nextState = new PatientEnteringState();
      const nextPatientNumber = snapshot.patientCase.patientNumber + 1;
      let nextSprite = Math.floor(Math.random() * 20) + 1;
      if (nextSprite === snapshot.patientCase.spriteIndex) {
        nextSprite = (nextSprite % 20) + 1;
      }
      const freshPatientCase = new PatientCaseModel({
        patientNumber: nextPatientNumber,
        spriteIndex: nextSprite,
        questions: snapshot.patientCase.questions,
      });
      const updatedSession = event.newSessionId
        ? snapshot.session.withPlayerId(event.newSessionId)
        : snapshot.session;

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
          patientCase: freshPatientCase,
          speaker: 'Dr. Jev',
          dialogueText: `Alright, let's bring in ${freshPatientCase.patientName}! Come on in from the waiting room.`,
        },
      };
    }

    return { nextState: this, nextSnapshot: snapshot };
  }
}
