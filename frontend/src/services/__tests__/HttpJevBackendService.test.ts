import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpJevBackendService } from '../HttpJevBackendService';

describe('HttpJevBackendService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls POST /api/sessions and GET /api/questions on initializeSession', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith('/sessions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ session_id: 42 }),
        });
      }
      if (url.endsWith('/questions')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([{ id: 'q1', text: 'Where does it hurt?' }]),
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    const service = new HttpJevBackendService('/api');
    const result = await service.initializeSession();

    expect(result.sessionId).toBe('42');
    expect(result.questions).toEqual([
      { id: 'q1', text: 'Where does it hurt?' },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('calls POST /api/sessions/{session_id}/answers and maps JevAssessment into JevJudgementModel', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          criticality: 9,
          call_ambulance: true,
          treatment: 'surgery',
          patient_honesty: 3,
          patient_emotion: 'angry',
          kick_out_office: true,
        }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const service = new HttpJevBackendService('/api');
    const res = await service.submitAnswers({
      sessionId: '42',
      answers: [{ question_id: 'q1', answer: 'Severe chest pain!' }],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/sessions/42/answers',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          answers: [{ question_id: 'q1', answer: 'Severe chest pain!' }],
        }),
      })
    );

    expect(res.sessionId).toBe('42');
    expect(res.judgement.criticalityScore).toBe(9);
    expect(res.judgement.criticality).toBe('Critical');
    expect(res.judgement.callAmbulance).toBe(true);
    expect(res.judgement.recommendedTreatment).toBe('Immediate Surgery');
    expect(res.judgement.patientHonestyScore).toBe(3);
    expect(res.judgement.isPatientLying).toBe(true);
    expect(res.judgement.formattedEmotion).toBe('Angry');
    expect(res.judgement.kickOutOffice).toBe(true);
  });
});

