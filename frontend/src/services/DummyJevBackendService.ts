import {
  JevJudgementModel,
  type JevJudgementData,
} from '../models/JevJudgementModel';
import type {
  IJevBackendService,
  InitPlayerResponseDto,
  SubmitAnswerRequestDto,
  SubmitAnswerResult,
} from './IJevBackendService';

export const DUMMY_PLAYER_ID = 'player-jev-demo-001';

export const DUMMY_JUDGEMENT_DATA: JevJudgementData = {
  recommendedTreatment: 'Prescribe 500mg Paracetamol & 48h bed rest',
  criticality: 'Moderate',
  callAmbulance: false,
  trustPatient: true,
  isPatientLying: false,
  confidenceScore: 87,
  clinicalNotes:
    'Patient symptoms appear consistent with mild viral fatigue, though minor exaggeration detected in pain reporting.',
};

export const DUMMY_DOCTOR_REACTION =
  "Hmm, interesting... I've noted that down in the JEV diagnostic system.";

/**
 * Dummy backend integration that always returns the same deterministic response
 * while strictly honoring the playerId request/response contract.
 */
export class DummyJevBackendService implements IJevBackendService {
  private readonly simulatedDelayMs: number;

  constructor(simulatedDelayMs = 350) {
    this.simulatedDelayMs = simulatedDelayMs;
  }

  public async requestNewPlayerId(): Promise<InitPlayerResponseDto> {
    await this.delay();
    return {
      playerId: DUMMY_PLAYER_ID,
    };
  }

  public async submitPatientAnswer(
    request: SubmitAnswerRequestDto
  ): Promise<SubmitAnswerResult> {
    if (!request.playerId) {
      throw new Error('playerId is required on every backend request.');
    }

    await this.delay();

    return {
      playerId: request.playerId,
      judgement: new JevJudgementModel(DUMMY_JUDGEMENT_DATA),
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

