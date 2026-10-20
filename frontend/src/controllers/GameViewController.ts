import type { IJevBackendService } from '../services/IJevBackendService';
import { GameStateMachine } from '../state/GameStateMachine';
import type { GameStateSnapshot } from '../state/IGameStateNode';

/**
 * View Controller coordinating user actions, FastAPI backend service calls, and the GameStateMachine.
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
   * Calls POST /sessions and GET /questions on the backend and initializes the game session.
   */
  public async initializeSession(): Promise<void> {
    try {
      const response = await this.backendService.initializeSession();
      this.stateMachine.dispatch({
        type: 'SESSION_INITIALIZED',
        playerId: response.sessionId,
        questions: response.questions,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to initialize session';
      this.stateMachine.dispatch({
        type: 'SESSION_ERROR',
        error: message,
      });
    }
  }

  /**
   * Advances the consultation when in a dialogue-advance state (e.g., PATIENT_ENTERING or CONSULTATION_COMPLETE).
   * When starting a new patient, creates a fresh backend session ID.
   */
  public advanceConsultation = async (): Promise<void> => {
    const { stateId } = this.stateMachine.getSnapshot();

    if (stateId === 'PATIENT_ENTERING') {
      this.stateMachine.dispatch({ type: 'BEGIN_CONSULTATION' });
    } else if (stateId === 'CONSULTATION_COMPLETE') {
      try {
        const nextSession = await this.backendService.initializeSession();
        this.stateMachine.dispatch({
          type: 'NEXT_PATIENT',
          newSessionId: nextSession.sessionId,
        });
      } catch {
        this.stateMachine.dispatch({ type: 'NEXT_PATIENT' });
      }
    }
  };

  /**
   * Submits the newly typed answer for the current question to POST /sessions/{session_id}/answers
   * (the backend appends each submitted answer onto `store.SESSIONS[session_id]`).
   */
  public submitPatientAnswer = async (rawAnswer: string): Promise<void> => {
    const trimmed = rawAnswer.trim();
    const snapshot = this.stateMachine.getSnapshot();

    if (!trimmed || !snapshot.canTypeAnswer || !snapshot.session.playerId) {
      return;
    }

    const sessionId = snapshot.session.playerId;
    const currentQuestionId = snapshot.patientCase.currentQuestion.id;

    this.stateMachine.dispatch({
      type: 'SUBMIT_ANSWER',
      answer: trimmed,
    });

    try {
      const result = await this.backendService.submitAnswers({
        sessionId,
        answers: [
          {
            question_id: currentQuestionId,
            answer: trimmed,
          },
        ],
      });

      this.stateMachine.dispatch({
        type: 'JEV_RESPONSE_RECEIVED',
        playerId: result.sessionId,
        judgement: result.judgement,
        doctorReaction: result.doctorReaction,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit answer';
      this.stateMachine.dispatch({
        type: 'SESSION_ERROR',
        error: message,
      });
    }
  };
}
