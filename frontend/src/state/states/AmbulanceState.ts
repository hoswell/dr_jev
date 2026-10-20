import type { GameEvent, GameStateSnapshot, IGameStateNode } from '../IGameStateNode';
import { ConsultationCompleteState } from './ConsultationCompleteState';

export class WaitingForAmbulanceState implements IGameStateNode {
  public readonly id = 'WAITING_FOR_AMBULANCE' as const;
  public readonly label = 'Waiting for Ambulance';
  public readonly canTypeAnswer = false;
  public readonly canAdvanceDialogue = false;
  public readonly advanceButtonLabel = null;

  public handleEvent(snapshot: GameStateSnapshot, event: GameEvent): ReturnType<IGameStateNode['handleEvent']> {
    if (event.type === 'AMBULANCE_ARRIVED') {
      const nextState = new AmbulanceArrivedState();
      return {
        nextState,
        nextSnapshot: {
          ...snapshot,
          stateId: nextState.id,
          stateLabel: nextState.label,
          canAdvanceDialogue: nextState.canAdvanceDialogue,
          advanceButtonLabel: nextState.advanceButtonLabel,
          dialogueText: 'The ambulance has arrived. The consultation is complete and the patient is ready for the ambulance crew.',
        },
      };
    }
    return { nextState: this, nextSnapshot: snapshot };
  }
}

export class AmbulanceArrivedState implements IGameStateNode {
  public readonly id = 'AMBULANCE_ARRIVED' as const;
  public readonly label = 'Ambulance Arrived';
  public readonly canTypeAnswer = false;
  public readonly canAdvanceDialogue = true;
  public readonly advanceButtonLabel = 'Call Next Patient →';

  public handleEvent(snapshot: GameStateSnapshot, event: GameEvent): ReturnType<IGameStateNode['handleEvent']> {
    if (event.type === 'NEXT_PATIENT') {
      return new ConsultationCompleteState().handleEvent(snapshot, event);
    }
    return { nextState: this, nextSnapshot: snapshot };
  }
}
