import type {
  GameEvent,
  GameStateSnapshot,
  IGameStateNode,
} from '../IGameStateNode';
import { AwaitingPatientInputState } from './AwaitingPatientInputState';
import { ConsultationCompleteState } from './ConsultationCompleteState';
import { WaitingForAmbulanceState } from './AmbulanceState';

export class EvaluatingWithJevState implements IGameStateNode {
  public readonly id = 'EVALUATING_WITH_JEV' as const;
  public readonly label = 'Dr. Jev Evaluating Answer';
  public readonly canTypeAnswer = false;
  public readonly canAdvanceDialogue = false;
  public readonly advanceButtonLabel = null;

  public handleEvent(
    snapshot: GameStateSnapshot,
    event: GameEvent
  ): { nextState: IGameStateNode; nextSnapshot: GameStateSnapshot } {
    if (event.type === 'JEV_RESPONSE_RECEIVED') {
      const updatedSession = snapshot.session.withPlayerId(event.playerId);
      // An ambulance response ends questioning, including on the final question.
      if (event.judgement.callAmbulance) {
        const nextState = new WaitingForAmbulanceState();
        return {
          nextState,
          nextSnapshot: {
            ...snapshot,
            stateId: nextState.id,
            stateLabel: nextState.label,
            canTypeAnswer: nextState.canTypeAnswer,
            canAdvanceDialogue: nextState.canAdvanceDialogue,
            advanceButtonLabel: nextState.advanceButtonLabel,
            session: updatedSession,
            patientCase: snapshot.patientCase.withJudgementAndAdvance(event.judgement, false),
            speaker: 'Dr. Jev',
            dialogueText: 'We need an ambulance. Let’s head outside and wait for the crew. No more questions for now.',
            error: null,
          },
        };
      }
      const isFinalQuestion = snapshot.patientCase.isLastQuestion;
      const isKickedOut = event.judgement.kickOutOffice;

      if (isKickedOut) {
        const nextState = new ConsultationCompleteState();
        const completedPatientCase =
          snapshot.patientCase.withJudgementAndAdvance(event.judgement, false);

        return {
          nextState,
          nextSnapshot: {
            ...snapshot,
            stateId: nextState.id,
            stateLabel: nextState.label,
            canTypeAnswer: nextState.canTypeAnswer,
            canAdvanceDialogue: nextState.canAdvanceDialogue,
            advanceButtonLabel: nextState.advanceButtonLabel,
            session: updatedSession,
            patientCase: completedPatientCase,
            speaker: 'Dr. Jev',
            dialogueText:
              "Hold on—Dr. Jev flags extreme hostility or disruption! I order you to leave my office right now! This consultation is terminated.",
            error: null,
          },
        };
      }

      if (isFinalQuestion) {
        const nextState = new ConsultationCompleteState();
        const completedPatientCase =
          snapshot.patientCase.withJudgementAndAdvance(event.judgement, false);

        return {
          nextState,
          nextSnapshot: {
            ...snapshot,
            stateId: nextState.id,
            stateLabel: nextState.label,
            canTypeAnswer: nextState.canTypeAnswer,
            canAdvanceDialogue: nextState.canAdvanceDialogue,
            advanceButtonLabel: nextState.advanceButtonLabel,
            session: updatedSession,
            patientCase: completedPatientCase,
            speaker: 'Dr. Jev',
            dialogueText: `${event.doctorReaction} All ${snapshot.patientCase.totalQuestions} questions complete! Review the final Dr. Jev assessment on the patient chart to the right.`,
            error: null,
          },
        };
      }

      const nextState = new AwaitingPatientInputState();
      const advancedPatientCase = snapshot.patientCase.withJudgementAndAdvance(
        event.judgement,
        true
      );

      return {
        nextState,
        nextSnapshot: {
          ...snapshot,
          stateId: nextState.id,
          stateLabel: nextState.label,
          canTypeAnswer: nextState.canTypeAnswer,
          canAdvanceDialogue: nextState.canAdvanceDialogue,
          advanceButtonLabel: nextState.advanceButtonLabel,
          session: updatedSession,
          patientCase: advancedPatientCase,
          speaker: 'Dr. Jev',
          dialogueText: advancedPatientCase.currentQuestionText,
          error: null,
        },
      };
    }

    if (event.type === 'SESSION_ERROR') {
      const nextState = new AwaitingPatientInputState();
      return {
        nextState,
        nextSnapshot: {
          ...snapshot,
          stateId: nextState.id,
          stateLabel: nextState.label,
          canTypeAnswer: nextState.canTypeAnswer,
          canAdvanceDialogue: nextState.canAdvanceDialogue,
          advanceButtonLabel: nextState.advanceButtonLabel,
          speaker: 'System',
          dialogueText: `Backend error: ${event.error}. Please try submitting again.`,
          error: event.error,
        },
      };
    }

    return { nextState: this, nextSnapshot: snapshot };
  }
}
