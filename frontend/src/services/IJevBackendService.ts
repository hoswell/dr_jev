import type { JevJudgementModel } from '../models/JevJudgementModel';
import type { BackendQuestionDto } from '../models/PatientCaseModel';

export interface InitSessionResult {
  readonly sessionId: string;
  readonly questions: readonly BackendQuestionDto[];
}

export interface AnswerSubmissionItemDto {
  readonly question_id: string;
  readonly answer: string;
}

export interface SubmitAnswerRequestDto {
  readonly sessionId: string;
  readonly answers: readonly AnswerSubmissionItemDto[];
}

export interface SubmitAnswerResult {
  readonly sessionId: string;
  readonly judgement: JevJudgementModel;
  readonly doctorReaction: string;
}

/**
 * Contract for any backend JEV service implementation (HTTP FastAPI backend or test mock).
 */
export interface IJevBackendService {
  initializeSession(): Promise<InitSessionResult>;
  submitAnswers(request: SubmitAnswerRequestDto): Promise<SubmitAnswerResult>;
}
