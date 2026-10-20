import { useGame } from '../../hooks/useGame';

export function JudgementGrid() {
  const { snapshot } = useGame();
  const judgement = snapshot.patientCase.latestJudgement;

  if (!judgement) {
    return (
      <div className="record-empty">
        Awaiting first patient answer to compute JEV judgements...
      </div>
    );
  }

  const criticalityPercent = Math.min(
    100,
    Math.max(0, (judgement.criticalityScore / 9) * 100)
  );
  const honestyPercent = Math.min(
    100,
    Math.max(0, (judgement.patientHonestyScore / 9) * 100)
  );

  return (
    <div className="judgement-grid">
      <div className="judgement-card full-width">
        <span className="judgement-label">Recommended Treatment</span>
        <div className="judgement-val-row">
          <span className="judgement-value highlight">
            {judgement.recommendedTreatment}
          </span>
          {judgement.treatmentConfidenceDisplay && (
            <span className="confidence-tag">
              {judgement.treatmentConfidenceDisplay}
            </span>
          )}
        </div>
      </div>

      <div className="judgement-card full-width">
        <span className="judgement-label">Criticality (0–9)</span>
        <div className="metric-bar-container">
          <div className="metric-bar-track criticality-gradient">
            <div
              className="metric-bar-marker"
              style={{ left: `${criticalityPercent}%` }}
              title={`Criticality: ${judgement.criticalityScore}/9`}
            />
          </div>
          <div className="metric-bar-legend">
            <span>0 (Low)</span>
            <span>9 (Critical)</span>
          </div>
          <div className="metric-sentence-row">
            <span className="metric-sentence">{judgement.criticalityDisplay}</span>
            {judgement.criticalityConfidenceDisplay && (
              <span className="confidence-tag">
                {judgement.criticalityConfidenceDisplay}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="judgement-card full-width">
        <span className="judgement-label">Patient Honesty (0–9)</span>
        <div className="metric-bar-container">
          <div className="metric-bar-track honesty-gradient">
            <div
              className="metric-bar-marker"
              style={{ left: `${honestyPercent}%` }}
              title={`Honesty: ${judgement.patientHonestyScore}/9`}
            />
          </div>
          <div className="metric-bar-legend">
            <span>0 (Lying)</span>
            <span>9 (Truthful)</span>
          </div>
          <div className="metric-sentence-row">
            <span className="metric-sentence">{judgement.formattedHonestyStatus}</span>
            {judgement.honestyConfidenceDisplay && (
              <span className="confidence-tag">
                {judgement.honestyConfidenceDisplay}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="judgement-card full-width">
        <span className="judgement-label">Patient Emotion</span>
        <div className="judgement-val-row">
          <span
            className={`judgement-pill ${
              judgement.patientEmotion === 'calm' ? 'pill-safe' : 'pill-warning'
            }`}
          >
            {judgement.formattedEmotion}
          </span>
          {judgement.patientEmotionConfidenceDisplay && (
            <span className="confidence-tag">
              {judgement.patientEmotionConfidenceDisplay}
            </span>
          )}
        </div>
      </div>

      <div className="judgement-card full-width">
        <span className="judgement-label">Clinic Dismissal Status</span>
        <div className="judgement-val-row">
          <span
            className={`judgement-pill ${
              judgement.kickOutOffice ? 'pill-danger' : 'pill-safe'
            }`}
          >
            {judgement.formattedKickOutStatus}
          </span>
          {judgement.kickOutProbabilityDisplay && (
            <span className="confidence-tag">
              {judgement.kickOutProbabilityDisplay}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
