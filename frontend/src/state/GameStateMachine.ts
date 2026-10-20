import { PatientCaseModel } from '../models/PatientCaseModel';
import { PlayerSessionModel } from '../models/PlayerSessionModel';
import type {
  GameEvent,
  GameStateSnapshot,
  IGameStateNode,
} from './IGameStateNode';
import { InitSessionState } from './states/InitSessionState';

export type StateMachineListener = () => void;

/**
 * Stateful State Machine Coordinator that delegates transitions to small single-responsibility state classes.
 * Implements a subscriber store interface compatible with React's useSyncExternalStore.
 */
export class GameStateMachine {
  private currentStateNode: IGameStateNode;
  private currentSnapshot: GameStateSnapshot;
  private readonly listeners = new Set<StateMachineListener>();

  constructor(initialNode: IGameStateNode = new InitSessionState()) {
    this.currentStateNode = initialNode;
    this.currentSnapshot = {
      stateId: initialNode.id,
      stateLabel: initialNode.label,
      canTypeAnswer: initialNode.canTypeAnswer,
      canAdvanceDialogue: initialNode.canAdvanceDialogue,
      advanceButtonLabel: initialNode.advanceButtonLabel,
      session: new PlayerSessionModel(null),
      patientCase: new PatientCaseModel({ patientNumber: 1 }),
      speaker: 'System',
      dialogueText: "Connecting to Dr. Jev's Clinic...",
      error: null,
    };
  }

  public getSnapshot = (): GameStateSnapshot => {
    return this.currentSnapshot;
  };

  public dispatch(event: GameEvent): GameStateSnapshot {
    const { nextState, nextSnapshot } = this.currentStateNode.handleEvent(
      this.currentSnapshot,
      event
    );

    if (nextSnapshot !== this.currentSnapshot || nextState !== this.currentStateNode) {
      this.currentStateNode = nextState;
      this.currentSnapshot = nextSnapshot;
      this.notifyListeners();
    }

    return this.currentSnapshot;
  }

  public subscribe = (listener: StateMachineListener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

