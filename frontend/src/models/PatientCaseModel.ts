import { JevJudgementModel } from './JevJudgementModel';
import { QuestionAnswerPair } from './QuestionAnswerPair';

export const DEFAULT_DOCTOR_QUESTIONS: readonly string[] = [
  '1. What brings you into the clinic today, and where does it hurt?',
  '2. How long have you been experiencing these symptoms, and how sudden was the onset?',
  '3. On a scale of 1 to 10, how severe is your discomfort right now?',
  '4. Have you taken any medications, remedies, or unusual substances in the last 24 hours?',
  '5. Is there anything else about your lifestyle or medical history you might be holding back?',
];

export interface PatientCaseProps {
  readonly patientNumber: number;
  readonly patientId?: string;
  readonly patientName?: string;
  readonly questions?: readonly string[];
  readonly currentQuestionIndex?: number;
  readonly recordedAnswers?: readonly QuestionAnswerPair[];
  readonly latestJudgement?: JevJudgementModel | null;
}

/**
 * Immutable domain model representing a single patient's consultation case and medical record.
 */
export class PatientCaseModel {
  public readonly patientNumber: number;
  public readonly patientId: string;
  public readonly patientName: string;
  public readonly questions: readonly string[];
  public readonly currentQuestionIndex: number;
  public readonly recordedAnswers: readonly QuestionAnswerPair[];
  public readonly latestJudgement: JevJudgementModel | null;

  constructor(props: PatientCaseProps) {
    this.patientNumber = props.patientNumber;
    this.patientId = props.patientId ?? `patient-00${props.patientNumber}`;
    this.patientName = props.patientName ?? `Patient #${props.patientNumber}`;
    this.questions = props.questions ?? DEFAULT_DOCTOR_QUESTIONS;
    this.currentQuestionIndex = props.currentQuestionIndex ?? 0;
    this.recordedAnswers = props.recordedAnswers ?? [];
    this.latestJudgement = props.latestJudgement ?? null;
  }

  public get currentQuestionText(): string {
    return (
      this.questions[this.currentQuestionIndex] ??
      this.questions[this.questions.length - 1]
    );
  }

  public get totalQuestions(): number {
    return this.questions.length;
  }

  public get isLastQuestion(): boolean {
    return this.currentQuestionIndex >= this.questions.length - 1;
  }

  public get progressLabel(): string {
    const current = Math.min(this.currentQuestionIndex + 1, this.totalQuestions);
    return `Question ${current} of ${this.totalQuestions}`;
  }

  public withRecordedAnswer(answerText: string): PatientCaseModel {
    const entry = new QuestionAnswerPair(
      this.currentQuestionIndex,
      this.currentQuestionText,
      answerText
    );
    return new PatientCaseModel({
      patientNumber: this.patientNumber,
      patientId: this.patientId,
      patientName: this.patientName,
      questions: this.questions,
      currentQuestionIndex: this.currentQuestionIndex,
      recordedAnswers: [...this.recordedAnswers, entry],
      latestJudgement: this.latestJudgement,
    });
  }

  public withJudgementAndAdvance(
    judgement: JevJudgementModel,
    advanceIndex: boolean
  ): PatientCaseModel {
    const nextIndex = advanceIndex
      ? Math.min(this.currentQuestionIndex + 1, this.totalQuestions - 1)
      : this.currentQuestionIndex;

    return new PatientCaseModel({
      patientNumber: this.patientNumber,
      patientId: this.patientId,
      patientName: this.patientName,
      questions: this.questions,
      currentQuestionIndex: nextIndex,
      recordedAnswers: this.recordedAnswers,
      latestJudgement: judgement,
    });
  }
}

