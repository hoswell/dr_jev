import { useGame } from '../../hooks/useGame';

export function JudgementGrid() {
  const { snapshot } = useGame();
  const judgement = snapshot.patientCase.latestJudgement;

  if (!judgement) {
    return (
      <div className="record-empty">
        Awaiting first patient answer to compute Dr. Jev's judgements...
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
  const stabilityPercent =
    judgement.patientStabilityScore !== undefined
      ? Math.min(100, Math.max(0, (judgement.patientStabilityScore / 9) * 100))
      : 0;

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

      {/* Combined Clinical Metrics Card: Criticality, Honesty, and Strangeness */}
      <div className="judgement-card full-width">
        {/* Metric 1: Criticality */}
        <div className="metric-block">
          <div className="metric-header-row">
            <span className="judgement-label">Criticality (0–9)</span>
            {judgement.criticalityConfidenceDisplay && (
              <span className="confidence-tag">
                {judgement.criticalityConfidenceDisplay}
              </span>
            )}
          </div>
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
            </div>
          </div>
        </div>

        <hr className="metric-card-divider" />

        {/* Metric 2: Patient Honesty */}
        <div className="metric-block">
          <div className="metric-header-row">
            <span className="judgement-label">Patient Honesty (0–9)</span>
            {judgement.honestyConfidenceDisplay && (
              <span className="confidence-tag">
                {judgement.honestyConfidenceDisplay}
              </span>
            )}
          </div>
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
            </div>
          </div>
        </div>

        {/* Metric 3: Patient Strangeness / Stability */}
        {judgement.patientStabilityScore !== undefined && (
          <>
            <hr className="metric-card-divider" />
            <div className="metric-block">
              <div className="metric-header-row">
                <span className="judgement-label">Strangeness (0–9)</span>
                {judgement.stabilityConfidenceDisplay && (
                  <span className="confidence-tag">
                    {judgement.stabilityConfidenceDisplay}
                  </span>
                )}
              </div>
              <div className="metric-bar-container">
                <div className="metric-bar-track stability-gradient">
                  <div
                    className="metric-bar-marker"
                    style={{ left: `${stabilityPercent}%` }}
                    title={`Strangeness: ${judgement.patientStabilityScore}/9`}
                  />
                </div>
                <div className="metric-bar-legend">
                  <span>0 (Bizarre / Delusional)</span>
                  <span>9 (Lucid / Grounded)</span>
                </div>
                <div className="metric-sentence-row">
                  <span className="metric-sentence">
                    {judgement.formattedStabilityStatus}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
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
    </div>
  );
}
