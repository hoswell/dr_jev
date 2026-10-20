import type { IJevBackendService } from '../services/IJevBackendService';
import { GameStateMachine } from '../state/GameStateMachine';
import type { GameStateSnapshot } from '../state/IGameStateNode';

/**
 * View Controller coordinating user actions, backend service calls, and the GameStateMachine.
 */
export class GameViewController {
  private readonly stateMachine: GameStateMachine;
  private readonly backendService: IJevBackendService;

  constructor(
    stateMachine: GameStateMachine,
    backendService: IJevBackendService
  ) {
    this.stateMachine = stateMachine;
    this.backendService = backendService;
  }

  public getSnapshot = (): GameStateSnapshot => {
    return this.stateMachine.getSnapshot();
  };

  public subscribe = (listener: () => void): (() => void) => {
    return this.stateMachine.subscribe(listener);
  };

  /**
   * Requests a new playerId from the backend and initializes the game session.
   */
  public async initializeSession(): Promise<void> {
    try {
      const response = await this.backendService.requestNewPlayerId();
      this.stateMachine.dispatch({
        type: 'SESSION_INITIALIZED',
        playerId: response.playerId,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to initialize player';
      this.stateMachine.dispatch({
        type: 'SESSION_ERROR',
        error: message,
      });
    }
  }

  /**
   * Advances the consultation when in a dialogue-advance state (e.g., PATIENT_ENTERING or CONSULTATION_COMPLETE).
   */
  public advanceConsultation = (): void => {
    const { stateId } = this.stateMachine.getSnapshot();

    if (stateId === 'PATIENT_ENTERING') {
      this.stateMachine.dispatch({ type: 'BEGIN_CONSULTATION' });
    } else if (stateId === 'CONSULTATION_COMPLETE') {
      this.stateMachine.dispatch({ type: 'NEXT_PATIENT' });
    }
  };

  /**
   * Submits the typed patient answer to the backend (including playerId) and updates the state machine
   * with the returned playerId and JEV judgement.
   */
  public submitPatientAnswer = async (rawAnswer: string): Promise<void> => {
    const trimmed = rawAnswer.trim();
    const snapshot = this.stateMachine.getSnapshot();

    if (!trimmed || !snapshot.canTypeAnswer || !snapshot.session.playerId) {
      return;
    }

    const playerId = snapshot.session.playerId;
    const { patientId, currentQuestionIndex, currentQuestionText } =
      snapshot.patientCase;

    this.stateMachine.dispatch({
      type: 'SUBMIT_ANSWER',
      answer: trimmed,
    });

    const result = await this.backendService.submitPatientAnswer({
      playerId,
      patientId,
      questionIndex: currentQuestionIndex,
      questionText: currentQuestionText,
      patientAnswer: trimmed,
    });

    this.stateMachine.dispatch({
      type: 'JEV_RESPONSE_RECEIVED',
      playerId: result.playerId,
      judgement: result.judgement,
      doctorReaction: result.doctorReaction,
    });
  };
}

