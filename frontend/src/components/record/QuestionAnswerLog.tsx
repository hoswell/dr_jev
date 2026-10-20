import { useGame } from '../../hooks/useGame';

export function QuestionAnswerLog() {
  const { snapshot } = useGame();
  const { recordedAnswers, totalQuestions } = snapshot.patientCase;

  return (
    <section className="record-section qa-log-section">
      <h3>
        Recorded Answers ({recordedAnswers.length} / {totalQuestions})
      </h3>
      {recordedAnswers.length === 0 ? (
        <div className="record-empty">No answers recorded yet.</div>
      ) : (
        <ul className="qa-history-list">
          {recordedAnswers.map((entry) => (
            <li key={entry.questionIndex} className="qa-history-item">
              <div className="qa-q">{entry.questionText}</div>
              <div className="qa-a">“{entry.answerText}”</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
