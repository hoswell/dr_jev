import { JudgementGrid } from './JudgementGrid';
import { QuestionAnswerLog } from './QuestionAnswerLog';
import { RecordHeader } from './RecordHeader';

export function PatientRecordPanel() {
  return (
    <aside className="patient-record-panel">
      <div className="clipboard-clip" />
      <RecordHeader />

      <section className="record-section">
        <h3>Dr. Jev's Diagnostic Judgements</h3>
        <JudgementGrid />
      </section>

      <QuestionAnswerLog />
    </aside>
  );
}

