import {
  JevJudgementModel,
  type BackendJevAssessmentDto,
} from '../models/JevJudgementModel';
import { DEFAULT_DOCTOR_QUESTIONS } from '../models/PatientCaseModel';
import type {
  IJevBackendService,
  InitSessionResult,
  SubmitAnswerRequestDto,
  SubmitAnswerResult,
} from './IJevBackendService';

export const DUMMY_PLAYER_ID = '1';

export const DUMMY_ASSESSMENT_DTO: BackendJevAssessmentDto = {
  criticality: 4,
  call_ambulance: false,
  treatment: 'medication',
  patient_honesty: 8,
  patient_emotion: 'calm',
  doctor_emotion: 'calm',
  kick_out_office: false,
};

export const DUMMY_DOCTOR_REACTION =
  "Hmm, interesting... I've noted that down in the JEV diagnostic system.";

/**
 * Deterministic fallback/test implementation of IJevBackendService matching the FastAPI schemas.
 */
export class DummyJevBackendService implements IJevBackendService {
  private readonly simulatedDelayMs: number;

  constructor(simulatedDelayMs = 200) {
    this.simulatedDelayMs = simulatedDelayMs;
  }

  public async initializeSession(): Promise<InitSessionResult> {
    await this.delay();
    return {
      sessionId: DUMMY_PLAYER_ID,
      questions: DEFAULT_DOCTOR_QUESTIONS,
    };
  }

  public async submitAnswers(
    request: SubmitAnswerRequestDto
  ): Promise<SubmitAnswerResult> {
    if (!request.sessionId) {
      throw new Error('sessionId is required on every backend request.');
    }

    await this.delay();

    return {
      sessionId: request.sessionId,
      judgement: new JevJudgementModel(DUMMY_ASSESSMENT_DTO),
      doctorReaction: DUMMY_DOCTOR_REACTION,
    };
  }

  private delay(): Promise<void> {
    if (this.simulatedDelayMs <= 0) {
      return Promise.resolve();
    }
    return new Promise((resolve) => setTimeout(resolve, this.simulatedDelayMs));
  }
}
