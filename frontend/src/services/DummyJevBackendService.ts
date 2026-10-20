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
  criticality: {
    score: 4,
    confidence: 0.88,
    label: 'Moderate, follow-up within a week',
  },
  call_ambulance: { noul: false, probability: 0.12 },
  treatment: {
    choice: 'medication',
    confidence: 0.95,
    label: 'Prescribe Medication',
  },
  patient_honesty: {
    score: 8,
    confidence: 0.92,
    label: 'Very honest and forthcoming',
  },
  patient_emotion: { choice: 'calm', confidence: 0.85, label: 'Calm' },
  doctor_emotion: { choice: 'calm', confidence: 0.9, label: 'Calm' },
  kick_out_office: { noul: false, probability: 0.05 },
};

export const DUMMY_DOCTOR_REACTION =
  "Hmm, interesting... I've noted that down in Dr. Jev's diagnostic system.";

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
