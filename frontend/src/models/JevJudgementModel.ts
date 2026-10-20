export type CriticalityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type SpeakerRole = 'Dr. Jev' | 'Patient' | 'System';

export type TreatmentType = 'rest' | 'medication' | 'hospital_visit' | 'surgery';

export type EmotionType = 'calm' | 'anxious' | 'angry' | 'sad' | 'afraid';

/**
 * Raw assessment returned by POST /sessions/{session_id}/answers in backend/schemas.py
 */
export interface BackendJevAssessmentDto {
  readonly criticality: number; // 0..9
  readonly call_ambulance: boolean;
  readonly treatment: TreatmentType;
  readonly patient_honesty: number; // 0..9
  readonly patient_emotion: EmotionType;
  readonly doctor_emotion?: EmotionType;
  readonly kick_out_office: boolean;
}

const TREATMENT_LABELS: Record<TreatmentType, string> = {
  rest: 'Rest & Recovery',
  medication: 'Prescribe Medication',
  hospital_visit: 'Hospital Visit / Admission',
  surgery: 'Immediate Surgery',
};

const CRITICALITY_CRITERIA: readonly string[] = [
  'No medical concern',
  'Very minor, self-resolving',
  'Minor, can wait weeks',
  'Mild, should see a doctor this month',
  'Moderate, should see a doctor this week',
  'Concerning, should be seen in the next few days',
  'Serious, should be seen within a day',
  'Urgent, needs same-day hospital care',
  'Severe, needs emergency care within the hour',
  'Life-threatening, needs immediate emergency intervention',
];

const HONESTY_CRITERIA: readonly string[] = [
  'Clearly lying',
  'Almost certainly lying',
  'Very likely hiding important facts',
  'Probably hiding or distorting facts',
  'Somewhat evasive',
  'Mostly honest with some doubtful details',
  'Honest, minor omissions',
  'Honest and fairly forthcoming',
  'Very honest and forthcoming',
  'Completely candid and truthful',
];

const EMOTION_LABELS: Record<EmotionType, string> = {
  calm: 'Calm',
  anxious: 'Anxious',
  angry: 'Angry',
  sad: 'Sad',
  afraid: 'Afraid',
};

/**
 * Domain model representing JEV's diagnostic and honesty evaluation of the patient,
 * mapped directly from the FastAPI backend's JevAssessment schema.
 */
export class JevJudgementModel {
  public readonly criticalityScore: number; // 0..9
  public readonly callAmbulance: boolean;
  public readonly treatment: TreatmentType;
  public readonly patientHonestyScore: number; // 0..9
  public readonly patientEmotion: EmotionType;
  public readonly doctorEmotion: EmotionType;
  public readonly kickOutOffice: boolean;

  constructor(dto: BackendJevAssessmentDto) {
    this.criticalityScore = dto.criticality;
    this.callAmbulance = dto.call_ambulance;
    this.treatment = dto.treatment;
    this.patientHonestyScore = dto.patient_honesty;
    this.patientEmotion = dto.patient_emotion;
    this.doctorEmotion = dto.doctor_emotion ?? 'calm';
    this.kickOutOffice = dto.kick_out_office;
  }

  public get recommendedTreatment(): string {
    return TREATMENT_LABELS[this.treatment] ?? this.treatment;
  }

  public get criticality(): CriticalityLevel {
    if (this.criticalityScore >= 7) return 'Critical';
    if (this.criticalityScore >= 5) return 'High';
    if (this.criticalityScore >= 2) return 'Moderate';
    return 'Low';
  }

  public get criticalityDisplay(): string {
    const desc =
      CRITICALITY_CRITERIA[this.criticalityScore] ?? this.criticality;
    return `${this.criticalityScore}/9 — ${desc}`;
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
    const desc = HONESTY_CRITERIA[this.patientHonestyScore] ?? '';
    return `${this.patientHonestyScore}/9 — ${desc}`;
  }

  public get formattedEmotion(): string {
    return EMOTION_LABELS[this.patientEmotion] ?? this.patientEmotion;
  }

  public get formattedDoctorEmotion(): string {
    return EMOTION_LABELS[this.doctorEmotion] ?? this.doctorEmotion;
  }

  public get formattedKickOutStatus(): string {
    return this.kickOutOffice ? 'KICK OUT OF OFFICE!' : 'Keep in Clinic';
  }
}
