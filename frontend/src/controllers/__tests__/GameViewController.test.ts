import { describe, expect, it, vi } from 'vitest';
import { GameViewController } from '../GameViewController';
import {
  DUMMY_DOCTOR_REACTION,
  DUMMY_PLAYER_ID,
  DummyJevBackendService,
} from '../../services/DummyJevBackendService';
import { GameStateMachine } from '../../state/GameStateMachine';

describe('GameViewController & Backend Service Integration', () => {
  it('requests a sessionId on initializeSession and sends cumulative answers with question_id on submitPatientAnswer', async () => {
    const machine = new GameStateMachine();
    const service = new DummyJevBackendService(0);
    const submitSpy = vi.spyOn(service, 'submitAnswers');

    const controller = new GameViewController(machine, service);

    await controller.initializeSession();
    expect(controller.getSnapshot().session.playerId).toBe(DUMMY_PLAYER_ID);
    expect(controller.getSnapshot().stateId).toBe('PATIENT_ENTERING');

    await controller.advanceConsultation();
    expect(controller.getSnapshot().stateId).toBe('AWAITING_PATIENT_INPUT');

    await controller.submitPatientAnswer('My head hurts since yesterday');

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submitSpy).toHaveBeenCalledWith({
      sessionId: DUMMY_PLAYER_ID,
      answers: [
        {
          question_id: 'q1',
          answer: 'My head hurts since yesterday',
        },
      ],
    });

    const updatedSnap = controller.getSnapshot();
    expect(updatedSnap.session.playerId).toBe(DUMMY_PLAYER_ID);
    expect(updatedSnap.patientCase.currentQuestionIndex).toBe(1);
    expect(updatedSnap.patientCase.latestJudgement?.recommendedTreatment).toBe(
      'Prescribe Medication'
    );
    expect(updatedSnap.patientCase.latestJudgement?.formattedEmotion).toBe(
      'Calm'
    );
    expect(DUMMY_DOCTOR_REACTION).toBeTruthy();
  });
});
