import { describe, expect, it, vi } from 'vitest';
import { GameViewController } from '../GameViewController';
import {
  DUMMY_DOCTOR_REACTION,
  DUMMY_JUDGEMENT_DATA,
  DUMMY_PLAYER_ID,
  DummyJevBackendService,
} from '../../services/DummyJevBackendService';
import { GameStateMachine } from '../../state/GameStateMachine';

describe('GameViewController & DummyJevBackendService', () => {
  it('requests a playerId on initializeSession and sends/receives it on every submitPatientAnswer', async () => {
    const machine = new GameStateMachine();
    const service = new DummyJevBackendService(0);
    const submitSpy = vi.spyOn(service, 'submitPatientAnswer');

    const controller = new GameViewController(machine, service);

    await controller.initializeSession();
    expect(controller.getSnapshot().session.playerId).toBe(DUMMY_PLAYER_ID);
    expect(controller.getSnapshot().stateId).toBe('PATIENT_ENTERING');

    controller.advanceConsultation();
    expect(controller.getSnapshot().stateId).toBe('AWAITING_PATIENT_INPUT');

    await controller.submitPatientAnswer('My head hurts since yesterday');

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        playerId: DUMMY_PLAYER_ID,
        patientId: 'patient-001',
        questionIndex: 0,
        patientAnswer: 'My head hurts since yesterday',
      })
    );

    const updatedSnap = controller.getSnapshot();
    expect(updatedSnap.session.playerId).toBe(DUMMY_PLAYER_ID);
    expect(updatedSnap.patientCase.currentQuestionIndex).toBe(1);
    expect(updatedSnap.patientCase.latestJudgement?.recommendedTreatment).toBe(
      DUMMY_JUDGEMENT_DATA.recommendedTreatment
    );
    expect(updatedSnap.patientCase.latestJudgement?.clinicalNotes).toBe(
      DUMMY_JUDGEMENT_DATA.clinicalNotes
    );
    expect(DUMMY_DOCTOR_REACTION).toBeTruthy();
  });
});

