export class QuestionAnswerPair {
  public readonly questionIndex: number;
  public readonly questionText: string;
  public readonly answerText: string;

  constructor(questionIndex: number, questionText: string, answerText: string) {
    this.questionIndex = questionIndex;
    this.questionText = questionText;
    this.answerText = answerText;
  }
}

