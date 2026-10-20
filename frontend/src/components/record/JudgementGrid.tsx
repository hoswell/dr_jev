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
        <div className="judgement-val-row">
          <span
            className={`judgement-pill criticality-${judgement.criticality.toLowerCase()}`}
          >
            {judgement.criticalityDisplay}
          </span>
          {judgement.criticalityConfidenceDisplay && (
            <span className="confidence-tag">
              {judgement.criticalityConfidenceDisplay}
            </span>
          )}
        </div>
      </div>

      <div className="judgement-card">
        <span className="judgement-label">Call Ambulance?</span>
        <div className="judgement-val-row">
          <span
            className={`judgement-pill ${
              judgement.callAmbulance ? 'pill-danger' : 'pill-safe'
            }`}
          >
            {judgement.formattedAmbulanceStatus}
          </span>
          {judgement.ambulanceProbabilityDisplay && (
            <span className="confidence-tag">
              {judgement.ambulanceProbabilityDisplay}
            </span>
          )}
        </div>
      </div>

      <div className="judgement-card">
        <span className="judgement-label">Kick Out of Office?</span>
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

      <div className="judgement-card">
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

      <div className="judgement-card">
        <span className="judgement-label">Doctor Emotion</span>
        <div className="judgement-val-row">
          <span
            className={`judgement-pill ${
              judgement.doctorEmotion === 'calm' ? 'pill-safe' : 'pill-warning'
            }`}
          >
            {judgement.formattedDoctorEmotion}
          </span>
          {judgement.doctorEmotionConfidenceDisplay && (
            <span className="confidence-tag">
              {judgement.doctorEmotionConfidenceDisplay}
            </span>
          )}
        </div>
      </div>

      <div className="judgement-card full-width">
        <span className="judgement-label">Patient Honesty (0–9)</span>
        <div className="judgement-val-row">
          <span
            className={`judgement-pill ${
              judgement.trustPatient ? 'pill-safe' : 'pill-danger'
            }`}
          >
            {judgement.formattedHonestyStatus}
          </span>
          {judgement.honestyConfidenceDisplay && (
            <span className="confidence-tag">
              {judgement.honestyConfidenceDisplay}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
