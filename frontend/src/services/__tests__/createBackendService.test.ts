import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBackendService } from '../createBackendService';
import { HttpJevBackendService } from '../HttpJevBackendService';

afterEach(() => {
  window.history.replaceState({}, '', '/');
  vi.unstubAllEnvs();
});

describe('Local ambulance preview', () => {
  it('returns an ambulance response without a network call in development', async () => {
    vi.stubEnv('DEV', true);
    window.history.replaceState({}, '', '/?demo=ambulance');
    const service = createBackendService();
    const session = await service.initializeSession();
    const result = await service.submitAnswers({ sessionId: session.sessionId, answers: [{ question_id: 'q1', answer: 'Preview' }] });
    expect(result.judgement.callAmbulance).toBe(true);
  });

  it('uses the real backend for the normal URL', () => {
    vi.stubEnv('DEV', true);
    expect(createBackendService()).toBeInstanceOf(HttpJevBackendService);
  });

  it('ignores the preview URL in a production build', () => {
    vi.stubEnv('DEV', false);
    window.history.replaceState({}, '', '/?demo=ambulance');
    expect(createBackendService()).toBeInstanceOf(HttpJevBackendService);
  });
});
