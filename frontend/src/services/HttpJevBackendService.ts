import {
  JevJudgementModel,
  type BackendJevAssessmentDto,
} from '../models/JevJudgementModel';
import {
  DEFAULT_DOCTOR_QUESTIONS,
  type BackendQuestionDto,
} from '../models/PatientCaseModel';
import type {
  IJevBackendService,
  InitSessionResult,
  SubmitAnswerRequestDto,
  SubmitAnswerResult,
} from './IJevBackendService';

interface SessionCreatedResponseDto {
  readonly session_id: number;
}

/**
 * Real HTTP client integrating with the FastAPI backend (`backend/src/backend/routes.py`):
 * - POST /sessions -> { session_id: int }
 * - GET /questions -> [{ id: str, text: str }]
 * - POST /sessions/{session_id}/answers -> JevAssessment
 */
export class HttpJevBackendService implements IJevBackendService {
  private readonly baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  public async initializeSession(): Promise<InitSessionResult> {
    const [sessionRes, questionsRes] = await Promise.all([
      fetch(`${this.baseUrl}/sessions`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      }),
      fetch(`${this.baseUrl}/questions`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }),
    ]);

    if (!sessionRes.ok) {
      throw new Error(
        `Failed to create session (HTTP ${sessionRes.status})`
      );
    }

    const sessionData = (await sessionRes.json()) as SessionCreatedResponseDto;
    let questions: readonly BackendQuestionDto[] = DEFAULT_DOCTOR_QUESTIONS;

    if (questionsRes.ok) {
      const fetchedQuestions =
        (await questionsRes.json()) as BackendQuestionDto[];
      if (Array.isArray(fetchedQuestions) && fetchedQuestions.length > 0) {
        questions = fetchedQuestions;
      }
    }

    return {
      sessionId: String(sessionData.session_id),
      questions,
    };
  }

  public async submitAnswers(
    request: SubmitAnswerRequestDto
  ): Promise<SubmitAnswerResult> {
    if (!request.sessionId) {
      throw new Error('sessionId is required on every backend request.');
    }

    const response = await fetch(
      `${this.baseUrl}/sessions/${encodeURIComponent(request.sessionId)}/answers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          answers: request.answers,
        }),
      }
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        `Backend error submitting answers (HTTP ${response.status})${
          detail ? `: ${detail}` : ''
        }`
      );
    }

    const assessmentDto = (await response.json()) as BackendJevAssessmentDto;
    const judgement = new JevJudgementModel(assessmentDto);

    return {
      sessionId: request.sessionId,
      judgement,
      doctorReaction: this.buildDoctorReaction(judgement),
    };
  }

  private buildDoctorReaction(judgement: JevJudgementModel): string {
    if (judgement.kickOutOffice) {
      return "Hold on—Dr. Jev flags hostility and disruption! I order you to leave my office right now! This consultation is terminated.";
    }
    if (judgement.callAmbulance) {
      return `Criticality is ${judgement.criticalityScore}/9! We need an ambulance for ${judgement.recommendedTreatment.toLowerCase()} immediately!`;
    }
    return `Dr. Jev updated the chart: ${judgement.recommendedTreatment} (Criticality ${judgement.criticalityScore}/9, Emotion: ${judgement.formattedEmotion}).`;
  }
}

