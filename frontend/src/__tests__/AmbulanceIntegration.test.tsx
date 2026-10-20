import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GameViewport } from '../components/layout/GameViewport';
import { GameProvider } from '../context/GameContext';
import { JevJudgementModel } from '../models/JevJudgementModel';
import { DUMMY_ASSESSMENT_DTO, DummyJevBackendService } from '../services/DummyJevBackendService';

describe('Ambulance scene', () => {
  it('switches outside instead of asking question two, then returns to a fresh consultation', async () => {
    const service = new DummyJevBackendService(0);
    vi.spyOn(service, 'submitAnswers').mockResolvedValue({
      sessionId: '1',
      judgement: new JevJudgementModel({ ...DUMMY_ASSESSMENT_DTO, call_ambulance: { noul: true, probability: 0.95 } }),
      doctorReaction: 'An ambulance is needed',
    });
    const initialize = vi.spyOn(service, 'initializeSession');
    const { container } = render(<GameProvider backendService={service}><GameViewport /></GameProvider>);

    fireEvent.click(await screen.findByRole('button', { name: /Start Consultation/i }));
    fireEvent.change(screen.getByPlaceholderText(/Type the patient's answer here/i), { target: { value: 'Synthetic emergency scenario' } });
    fireEvent.click(screen.getByRole('button', { name: /Send to Dr\. Jev/i }));

    await screen.findByRole('main', { name: /Outside the clinic/i });
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: /Call Next Patient/i })).toBeNull();
    expect(screen.getByText('Consultation stopped')).toBeDefined();
    expect(container.querySelector('.hospital-background-outside')?.getAttribute('style')).toContain('clinic-outside.png');
    expect(container.querySelector('.patient-sprite')).toBeNull();
    expect(container.textContent).not.toContain('How long have you been experiencing');

    fireEvent.animationEnd(container.querySelector('.ambulance-vehicle')!, { animationName: 'ambulanceArrival' });
    fireEvent.click(await screen.findByRole('button', { name: /Call Next Patient/i }, { timeout: 4500 }));
    await waitFor(() => expect(initialize).toHaveBeenCalledTimes(2));
    await screen.findByRole('button', { name: /Start Consultation/i });
    expect(container.querySelector('.hospital-background-outside')).toBeNull();
    expect(container.querySelector('.ambulance-vehicle')).toBeNull();
    expect(screen.getByText(/Awaiting first patient answer/i)).toBeDefined();
  });
});
