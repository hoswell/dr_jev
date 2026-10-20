export class QuestionAnswerPair {
  public readonly questionIndex: number;
  public readonly questionId: string;
  public readonly questionText: string;
  public readonly answerText: string;

  constructor(
    questionIndex: number,
    questionId: string,
    questionText: string,
    answerText: string
  ) {
    this.questionIndex = questionIndex;
    this.questionId = questionId;
    this.questionText = questionText;
    this.answerText = answerText;
  }
}
