export type CriticalityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type SpeakerRole = 'Dr. Jev' | 'Patient' | 'System';

export interface JevJudgementData {
  readonly recommendedTreatment: string;
  readonly criticality: CriticalityLevel;
  readonly callAmbulance: boolean;
  readonly trustPatient: boolean;
  readonly isPatientLying: boolean;
  readonly confidenceScore: number;
  readonly clinicalNotes: string;
}

/**
 * Domain model representing JEV's diagnostic and trust evaluation of the patient.
 */
export class JevJudgementModel {
  public readonly recommendedTreatment: string;
  public readonly criticality: CriticalityLevel;
  public readonly callAmbulance: boolean;
  public readonly trustPatient: boolean;
  public readonly isPatientLying: boolean;
  public readonly confidenceScore: number;
  public readonly clinicalNotes: string;

  constructor(data: JevJudgementData) {
    this.recommendedTreatment = data.recommendedTreatment;
    this.criticality = data.criticality;
    this.callAmbulance = data.callAmbulance;
    this.trustPatient = data.trustPatient;
    this.isPatientLying = data.isPatientLying;
    this.confidenceScore = data.confidenceScore;
    this.clinicalNotes = data.clinicalNotes;
  }

  public get formattedAmbulanceStatus(): string {
    return this.callAmbulance ? 'YES (URGENT)' : 'No';
  }

  public get formattedTrustStatus(): string {
    return this.trustPatient ? 'Trusted' : 'Skeptical';
  }

  public get formattedLieDetection(): string {
    return this.isPatientLying ? 'Deception Detected' : 'Truthful';
  }
}

