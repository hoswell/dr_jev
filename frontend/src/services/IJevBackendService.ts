import { JevJudgementModel, type JevJudgementData } from '../models/JevJudgementModel';

export interface InitPlayerResponseDto {
  readonly playerId: string;
}

export interface SubmitAnswerRequestDto {
  readonly playerId: string;
  readonly patientId: string;
  readonly questionIndex: number;
  readonly questionText: string;
  readonly patientAnswer: string;
}

export interface SubmitAnswerResponseDto {
  readonly playerId: string;
  readonly judgement: JevJudgementData;
  readonly doctorReaction: string;
}

export interface SubmitAnswerResult {
  readonly playerId: string;
  readonly judgement: JevJudgementModel;
  readonly doctorReaction: string;
}

/**
 * Contract for any backend JEV service implementation (dummy or real HTTP).
 */
export interface IJevBackendService {
  requestNewPlayerId(): Promise<InitPlayerResponseDto>;
  submitPatientAnswer(request: SubmitAnswerRequestDto): Promise<SubmitAnswerResult>;
}

