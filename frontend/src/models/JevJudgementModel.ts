export type CriticalityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type SpeakerRole = 'Dr. Jev' | 'Patient' | 'System';

export type TreatmentType = string;

export type EmotionType = 'calm' | 'anxious' | 'angry' | 'sad' | 'afraid';

export interface ScoreResultDto {
  readonly score: number;
  readonly confidence?: number;
  readonly label?: string | null;
}

export interface ChoiceResultDto<T extends string = string> {
  readonly choice: T;
  readonly confidence?: number;
  readonly label?: string | null;
}

export interface NoulResultDto {
  readonly noul: boolean;
  readonly probability?: number;
}

/**
 * Raw assessment returned by POST /sessions/{session_id}/answers in backend/schemas.py.
 * Supports both structured objects ({ score, confidence, label }, { choice, confidence, label }, { noul, probability })
 * and legacy flat primitives.
 */
export interface BackendJevAssessmentDto {
  readonly criticality: number | ScoreResultDto;
  readonly call_ambulance: boolean | NoulResultDto;
  readonly treatment: TreatmentType | ChoiceResultDto<TreatmentType>;
  readonly patient_honesty: number | ScoreResultDto;
  readonly patient_stability?: number | ScoreResultDto;
  readonly patient_emotion: EmotionType | ChoiceResultDto<EmotionType>;
  readonly doctor_emotion?: EmotionType | ChoiceResultDto<EmotionType>;
  readonly kick_out_office: boolean | NoulResultDto;
}

/**
 * Domain model representing Dr. Jev's diagnostic and honesty evaluation of the patient,
 * mapped directly from the FastAPI backend's JevAssessment schema.
 */
export class JevJudgementModel {
  public readonly criticalityScore: number; // 0..9
  public readonly criticalityConfidence?: number;
  public readonly criticalityLabel?: string;
  public readonly callAmbulance: boolean;
  public readonly callAmbulanceProbability?: number;
  public readonly treatment: TreatmentType;
  public readonly treatmentConfidence?: number;
  public readonly treatmentLabel?: string;
  public readonly patientHonestyScore: number; // 0..9
  public readonly patientHonestyConfidence?: number;
  public readonly patientHonestyLabel?: string;
  public readonly patientStabilityScore?: number; // 0..9
  public readonly patientStabilityConfidence?: number;
  public readonly patientStabilityLabel?: string;
  public readonly patientEmotion: EmotionType;
  public readonly patientEmotionConfidence?: number;
  public readonly patientEmotionLabel?: string;
  public readonly doctorEmotion: EmotionType;
  public readonly doctorEmotionConfidence?: number;
  public readonly doctorEmotionLabel?: string;
  public readonly kickOutOffice: boolean;
  public readonly kickOutOfficeProbability?: number;

  constructor(dto: BackendJevAssessmentDto) {
    if (typeof dto.criticality === 'number') {
      this.criticalityScore = dto.criticality;
    } else {
      this.criticalityScore = dto.criticality.score;
      this.criticalityConfidence = dto.criticality.confidence;
      this.criticalityLabel = dto.criticality.label ?? undefined;
    }

    if (typeof dto.call_ambulance === 'boolean') {
      this.callAmbulance = dto.call_ambulance;
    } else {
      this.callAmbulance = dto.call_ambulance.noul;
      this.callAmbulanceProbability = dto.call_ambulance.probability;
    }

    if (typeof dto.treatment === 'string') {
      this.treatment = dto.treatment;
    } else {
      this.treatment = dto.treatment.choice;
      this.treatmentConfidence = dto.treatment.confidence;
      this.treatmentLabel = dto.treatment.label ?? undefined;
    }

    if (typeof dto.patient_honesty === 'number') {
      this.patientHonestyScore = dto.patient_honesty;
    } else {
      this.patientHonestyScore = dto.patient_honesty.score;
      this.patientHonestyConfidence = dto.patient_honesty.confidence;
      this.patientHonestyLabel = dto.patient_honesty.label ?? undefined;
    }

    if (dto.patient_stability !== undefined) {
      if (typeof dto.patient_stability === 'number') {
        this.patientStabilityScore = dto.patient_stability;
      } else {
        this.patientStabilityScore = dto.patient_stability.score;
        this.patientStabilityConfidence = dto.patient_stability.confidence;
        this.patientStabilityLabel = dto.patient_stability.label ?? undefined;
      }
    }

    if (typeof dto.patient_emotion === 'string') {
      this.patientEmotion = dto.patient_emotion;
    } else {
      this.patientEmotion = dto.patient_emotion.choice;
      this.patientEmotionConfidence = dto.patient_emotion.confidence;
      this.patientEmotionLabel = dto.patient_emotion.label ?? undefined;
    }

    if (!dto.doctor_emotion) {
      this.doctorEmotion = 'calm';
      this.doctorEmotionLabel = 'Calm';
    } else if (typeof dto.doctor_emotion === 'string') {
      this.doctorEmotion = dto.doctor_emotion;
    } else {
      this.doctorEmotion = dto.doctor_emotion.choice;
      this.doctorEmotionConfidence = dto.doctor_emotion.confidence;
      this.doctorEmotionLabel = dto.doctor_emotion.label ?? undefined;
    }

    if (typeof dto.kick_out_office === 'boolean') {
      this.kickOutOffice = dto.kick_out_office;
    } else {
      this.kickOutOffice = dto.kick_out_office.noul;
      this.kickOutOfficeProbability = dto.kick_out_office.probability;
    }
  }

  public get recommendedTreatment(): string {
    return this.treatmentLabel ?? this.treatment;
  }

  public get criticality(): CriticalityLevel {
    if (this.criticalityScore >= 7) return 'Critical';
    if (this.criticalityScore >= 5) return 'High';
    if (this.criticalityScore >= 2) return 'Moderate';
    return 'Low';
  }

  public get criticalityDisplay(): string {
    const desc = this.criticalityLabel ?? this.criticality;
    return `${this.criticalityScore}/9 — ${desc}`;
  }

  public get criticalityConfidenceDisplay(): string | null {
    return this.criticalityConfidence !== undefined
      ? `${Math.round(this.criticalityConfidence * 100)}% conf`
      : null;
  }

  public get treatmentConfidenceDisplay(): string | null {
    return this.treatmentConfidence !== undefined
      ? `${Math.round(this.treatmentConfidence * 100)}% conf`
      : null;
  }

  public get ambulanceProbabilityDisplay(): string | null {
    return this.callAmbulanceProbability !== undefined
      ? `${Math.round(this.callAmbulanceProbability * 100)}% prob`
      : null;
  }

  public get kickOutProbabilityDisplay(): string | null {
    return this.kickOutOfficeProbability !== undefined
      ? `${Math.round(this.kickOutOfficeProbability * 100)}% prob`
      : null;
  }

  public get honestyConfidenceDisplay(): string | null {
    return this.patientHonestyConfidence !== undefined
      ? `${Math.round(this.patientHonestyConfidence * 100)}% conf`
      : null;
  }

  public get patientEmotionConfidenceDisplay(): string | null {
    return this.patientEmotionConfidence !== undefined
      ? `${Math.round(this.patientEmotionConfidence * 100)}% conf`
      : null;
  }

  public get doctorEmotionConfidenceDisplay(): string | null {
    return this.doctorEmotionConfidence !== undefined
      ? `${Math.round(this.doctorEmotionConfidence * 100)}% conf`
      : null;
  }

  public get trustPatient(): boolean {
    return this.patientHonestyScore >= 5;
  }

  public get isPatientLying(): boolean {
    return this.patientHonestyScore < 5;
  }

  public get formattedAmbulanceStatus(): string {
    return this.callAmbulance ? 'YES (URGENT)' : 'No';
  }

  public get formattedHonestyStatus(): string {
    const desc = this.patientHonestyLabel ?? '';
    return desc
      ? `${this.patientHonestyScore}/9 — ${desc}`
      : `${this.patientHonestyScore}/9`;
  }

  public get formattedStabilityStatus(): string {
    if (this.patientStabilityScore === undefined) return '';
    const desc = this.patientStabilityLabel ?? '';
    return desc
      ? `${this.patientStabilityScore}/9 — ${desc}`
      : `${this.patientStabilityScore}/9`;
  }

  public get stabilityConfidenceDisplay(): string | null {
    return this.patientStabilityConfidence !== undefined
      ? `${Math.round(this.patientStabilityConfidence * 100)}% conf`
      : null;
  }

  public get formattedEmotion(): string {
    return this.patientEmotionLabel ?? this.patientEmotion;
  }

  public get formattedDoctorEmotion(): string {
    return this.doctorEmotionLabel ?? this.doctorEmotion;
  }

  public get formattedKickOutStatus(): string {
    return this.kickOutOffice ? 'KICK OUT OF OFFICE!' : 'Keep in Clinic';
  }
}
