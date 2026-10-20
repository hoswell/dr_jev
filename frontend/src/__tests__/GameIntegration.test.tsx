import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameViewport } from '../components/layout/GameViewport';
import { GameProvider } from '../context/GameContext';
import {
  DUMMY_PLAYER_ID,
  DummyJevBackendService,
} from '../services/DummyJevBackendService';

describe('Dr. Jev UI Integration', () => {
  it('initializes with session_id, displays questions, accepts manual answers, and updates the right-hand patient record', async () => {
    const fastDummyService = new DummyJevBackendService(0);

    render(
      <GameProvider backendService={fastDummyService}>
        <GameViewport />
      </GameProvider>
    );

    // Wait for sessionId initialization
    await waitFor(() => {
      expect(screen.getAllByText(DUMMY_PLAYER_ID).length).toBeGreaterThan(0);
    });

    // Click "Start Consultation →"
    const startBtn = screen.getByRole('button', {
      name: /Start Consultation/i,
    });
    fireEvent.click(startBtn);

    // Input box should now be visible
    const input = screen.getByPlaceholderText(
      /Type the patient's answer here.../i
    );
    expect(input).toBeDefined();

    // Type an answer and submit
    fireEvent.change(input, {
      target: { value: 'Sharp pain in my left knee' },
    });
    const sendBtn = screen.getByRole('button', { name: /Send to Dr\. Jev/i });
    fireEvent.click(sendBtn);

    // Verify right-hand Patient Record Panel updates with JEV judgements & recorded answer
    await waitFor(() => {
      expect(screen.getByText('Prescribe Medication')).toBeDefined();
    });

    expect(screen.getByText(/Sharp pain in my left knee/i)).toBeDefined();
    expect(
      screen.getByText('4/9 — Moderate, follow-up within a week')
    ).toBeDefined();
    expect(
      screen.getByText('8/9 — Very honest and forthcoming')
    ).toBeDefined();
    expect(screen.getAllByText('Calm').length).toBeGreaterThanOrEqual(1);
  });
});
