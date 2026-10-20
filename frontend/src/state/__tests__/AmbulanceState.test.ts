import { describe, expect, it } from 'vitest';
import { JevJudgementModel } from '../../models/JevJudgementModel';
import { DUMMY_ASSESSMENT_DTO } from '../../services/DummyJevBackendService';
import { GameStateMachine } from '../GameStateMachine';

describe('Ambulance interruption', () => {
  it.each([
    { question: 0, callAmbulance: true, kickOutOffice: false },
    { question: 4, callAmbulance: { noul: true, probability: 0.95 }, kickOutOffice: false },
    { question: 2, callAmbulance: true, kickOutOffice: true },
  ])('interrupts on question $question for flat and structured assessments', ({ question, callAmbulance, kickOutOffice }) => {
    const machine = new GameStateMachine();
    machine.dispatch({ type: 'SESSION_INITIALIZED', playerId: '1' });
    machine.dispatch({ type: 'BEGIN_CONSULTATION' });
    for (let index = 0; index <= question; index += 1) {
      machine.dispatch({ type: 'SUBMIT_ANSWER', answer: `Answer ${index}` });
      machine.dispatch({
        type: 'JEV_RESPONSE_RECEIVED',
        playerId: '1',
        judgement: new JevJudgementModel({
          ...DUMMY_ASSESSMENT_DTO,
          call_ambulance: index === question ? callAmbulance : false,
          kick_out_office: index === question && kickOutOffice,
        }),
        doctorReaction: 'Response received',
      });
    }

    const waiting = machine.getSnapshot();
    expect(waiting.stateId).toBe('WAITING_FOR_AMBULANCE');
    expect(waiting.canTypeAnswer).toBe(false);
    expect(waiting.canAdvanceDialogue).toBe(false);
    expect(waiting.patientCase.currentQuestionIndex).toBe(question);
    expect(waiting.patientCase.recordedAnswers).toHaveLength(question + 1);
    expect(waiting.patientCase.latestJudgement?.callAmbulance).toBe(true);

    machine.dispatch({ type: 'SUBMIT_ANSWER', answer: 'Must be ignored' });
    machine.dispatch({ type: 'NEXT_PATIENT', newSessionId: '2' });
    expect(machine.getSnapshot()).toBe(waiting);

    const arrived = machine.dispatch({ type: 'AMBULANCE_ARRIVED' });
    expect(arrived.stateId).toBe('AMBULANCE_ARRIVED');
    expect(arrived.canTypeAnswer).toBe(false);
    expect(arrived.canAdvanceDialogue).toBe(true);
    expect(arrived.patientCase.currentQuestionIndex).toBe(question);

    const next = machine.dispatch({ type: 'NEXT_PATIENT', newSessionId: '2' });
    expect(next.stateId).toBe('PATIENT_ENTERING');
    expect(next.session.playerId).toBe('2');
    expect(next.patientCase.recordedAnswers).toHaveLength(0);
    expect(next.patientCase.latestJudgement).toBeNull();
  });
});
