import { describe, expect, it } from 'vitest';
import { JevJudgementModel } from '../../models/JevJudgementModel';
import {
  DUMMY_DOCTOR_REACTION,
  DUMMY_JUDGEMENT_DATA,
  DUMMY_PLAYER_ID,
} from '../../services/DummyJevBackendService';
import { GameStateMachine } from '../GameStateMachine';

describe('GameStateMachine & State Pattern nodes', () => {
  it('starts in INIT_SESSION and transitions to PATIENT_ENTERING when SESSION_INITIALIZED is dispatched', () => {
    const machine = new GameStateMachine();
    expect(machine.getSnapshot().stateId).toBe('INIT_SESSION');
    expect(machine.getSnapshot().session.playerId).toBeNull();

    const snap = machine.dispatch({
      type: 'SESSION_INITIALIZED',
      playerId: DUMMY_PLAYER_ID,
    });

    expect(snap.stateId).toBe('PATIENT_ENTERING');
    expect(snap.session.playerId).toBe(DUMMY_PLAYER_ID);
    expect(snap.canAdvanceDialogue).toBe(true);
    expect(snap.canTypeAnswer).toBe(false);
  });

  it('cycles through all 5 questions and transitions to CONSULTATION_COMPLETE on the 5th answer', () => {
    const machine = new GameStateMachine();
    machine.dispatch({
      type: 'SESSION_INITIALIZED',
      playerId: DUMMY_PLAYER_ID,
    });
    machine.dispatch({ type: 'BEGIN_CONSULTATION' });

    expect(machine.getSnapshot().stateId).toBe('AWAITING_PATIENT_INPUT');
    expect(machine.getSnapshot().canTypeAnswer).toBe(true);

    const dummyJudgement = new JevJudgementModel(DUMMY_JUDGEMENT_DATA);

    for (let i = 0; i < 5; i += 1) {
      expect(machine.getSnapshot().patientCase.currentQuestionIndex).toBe(i);

      machine.dispatch({
        type: 'SUBMIT_ANSWER',
        answer: `Test patient answer #${i + 1}`,
      });

      expect(machine.getSnapshot().stateId).toBe('EVALUATING_WITH_JEV');
      expect(machine.getSnapshot().canTypeAnswer).toBe(false);

      machine.dispatch({
        type: 'JEV_RESPONSE_RECEIVED',
        playerId: DUMMY_PLAYER_ID,
        judgement: dummyJudgement,
        doctorReaction: DUMMY_DOCTOR_REACTION,
      });

      if (i < 4) {
        expect(machine.getSnapshot().stateId).toBe('AWAITING_PATIENT_INPUT');
      } else {
        expect(machine.getSnapshot().stateId).toBe('CONSULTATION_COMPLETE');
      }
    }

    const finalSnap = machine.getSnapshot();
    expect(finalSnap.patientCase.recordedAnswers).toHaveLength(5);
    expect(finalSnap.patientCase.latestJudgement?.recommendedTreatment).toBe(
      DUMMY_JUDGEMENT_DATA.recommendedTreatment
    );

    // Calling next patient resets the case for Patient #2
    const nextPatientSnap = machine.dispatch({ type: 'NEXT_PATIENT' });
    expect(nextPatientSnap.stateId).toBe('PATIENT_ENTERING');
    expect(nextPatientSnap.patientCase.patientNumber).toBe(2);
    expect(nextPatientSnap.patientCase.recordedAnswers).toHaveLength(0);
    expect(nextPatientSnap.patientCase.latestJudgement).toBeNull();
  });
});

