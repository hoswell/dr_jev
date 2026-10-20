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

      <div className="judgement-card">
        <span className="judgement-label">Criticality</span>
        <span
          className={`judgement-pill criticality-${judgement.criticality.toLowerCase()}`}
        >
          {judgement.criticality}
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
        <span className="judgement-label">Trust Patient?</span>
        <span
          className={`judgement-pill ${
            judgement.trustPatient ? 'pill-safe' : 'pill-warning'
          }`}
        >
          {judgement.formattedTrustStatus}
        </span>
      </div>

      <div className="judgement-card">
        <span className="judgement-label">Patient Lying?</span>
        <span
          className={`judgement-pill ${
            judgement.isPatientLying ? 'pill-danger' : 'pill-safe'
          }`}
        >
          {judgement.formattedLieDetection}
        </span>
      </div>

      <div className="judgement-card full-width">
        <span className="judgement-label">
          JEV Assessment Notes (Confidence: {judgement.confidenceScore}%)
        </span>
        <p className="judgement-notes">{judgement.clinicalNotes}</p>
      </div>
    </div>
  );
}
