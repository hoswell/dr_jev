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
        <span className="judgement-value highlight">
          {judgement.recommendedTreatment}
        </span>
      </div>

      <div className="judgement-card full-width">
        <span className="judgement-label">Criticality (0–9)</span>
        <span
          className={`judgement-pill criticality-${judgement.criticality.toLowerCase()}`}
        >
          {judgement.criticalityDisplay}
        </span>
      </div>

      <div className="judgement-card">
        <span className="judgement-label">Call Ambulance?</span>
        <span
          className={`judgement-pill ${
            judgement.callAmbulance ? 'pill-danger' : 'pill-safe'
          }`}
        >
          {judgement.formattedAmbulanceStatus}
        </span>
      </div>

      <div className="judgement-card">
        <span className="judgement-label">Kick Out of Office?</span>
        <span
          className={`judgement-pill ${
            judgement.kickOutOffice ? 'pill-danger' : 'pill-safe'
          }`}
        >
          {judgement.formattedKickOutStatus}
        </span>
      </div>

      <div className="judgement-card">
        <span className="judgement-label">Patient Emotion</span>
        <span
          className={`judgement-pill ${
            judgement.patientEmotion === 'calm' ? 'pill-safe' : 'pill-warning'
          }`}
        >
          {judgement.formattedEmotion}
        </span>
      </div>

      <div className="judgement-card">
        <span className="judgement-label">Doctor Emotion</span>
        <span
          className={`judgement-pill ${
            judgement.doctorEmotion === 'calm' ? 'pill-safe' : 'pill-warning'
          }`}
        >
          {judgement.formattedDoctorEmotion}
        </span>
      </div>

      <div className="judgement-card full-width">
        <span className="judgement-label">Patient Honesty (0–9)</span>
        <span
          className={`judgement-pill ${
            judgement.trustPatient ? 'pill-safe' : 'pill-danger'
          }`}
        >
          {judgement.formattedHonestyStatus}
        </span>
      </div>
    </div>
  );
}
