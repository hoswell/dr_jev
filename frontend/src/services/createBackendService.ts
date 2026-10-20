import { DUMMY_ASSESSMENT_DTO, DummyJevBackendService } from './DummyJevBackendService';
import { HttpJevBackendService } from './HttpJevBackendService';
import type { IJevBackendService } from './IJevBackendService';

export function isAmbulancePreview(): boolean {
  return import.meta.env.DEV && new URLSearchParams(window.location.search).get('demo') === 'ambulance';
}

export function createBackendService(): IJevBackendService {
  if (isAmbulancePreview()) {
    return new DummyJevBackendService(350, {
      ...DUMMY_ASSESSMENT_DTO,
      criticality: { score: 8, confidence: 0.94 },
      call_ambulance: { noul: true, probability: 0.97 },
      treatment: { choice: 'hospital_visit', confidence: 0.96 },
      patient_emotion: { choice: 'afraid', confidence: 0.88 },
      doctor_emotion: { choice: 'anxious', confidence: 0.91 },
    });
  }
  return new HttpJevBackendService();
}
