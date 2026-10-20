import { JevJudgementModel, type SpeakerRole } from '../models/JevJudgementModel';
import {
  PatientCaseModel,
  type BackendQuestionDto,
} from '../models/PatientCaseModel';
import { PlayerSessionModel } from '../models/PlayerSessionModel';

export type GameStateId =
  | 'INIT_SESSION'
  | 'PATIENT_ENTERING'
  | 'AWAITING_PATIENT_INPUT'
  | 'EVALUATING_WITH_JEV'
  | 'WAITING_FOR_AMBULANCE'
  | 'AMBULANCE_ARRIVED'
  | 'CONSULTATION_COMPLETE';

export function isAmbulanceScene(stateId: GameStateId): boolean {
  return stateId === 'WAITING_FOR_AMBULANCE' || stateId === 'AMBULANCE_ARRIVED';
}

export interface GameStateSnapshot {
  readonly stateId: GameStateId;
  readonly stateLabel: string;
  readonly canTypeAnswer: boolean;
  readonly canAdvanceDialogue: boolean;
  readonly advanceButtonLabel: string | null;
  readonly session: PlayerSessionModel;
  readonly patientCase: PatientCaseModel;
  readonly speaker: SpeakerRole;
  readonly dialogueText: string;
  readonly error: string | null;
}

export type GameEvent =
  | {
      readonly type: 'SESSION_INITIALIZED';
      readonly playerId: string;
      readonly questions?: readonly BackendQuestionDto[];
    }
  | { readonly type: 'SESSION_ERROR'; readonly error: string }
  | { readonly type: 'BEGIN_CONSULTATION' }
  | { readonly type: 'SUBMIT_ANSWER'; readonly answer: string }
  | { readonly type: 'AMBULANCE_ARRIVED' }
  | {
      readonly type: 'JEV_RESPONSE_RECEIVED';
      readonly playerId: string;
      readonly judgement: JevJudgementModel;
      readonly doctorReaction: string;
    }
  | { readonly type: 'NEXT_PATIENT'; readonly newSessionId?: string };

/**
 * Contract for an individual state class in the State Pattern.
 * Each state class has a single responsibility: handling events and rules for that specific phase.
 */
export interface IGameStateNode {
  readonly id: GameStateId;
  readonly label: string;
  readonly canTypeAnswer: boolean;
  readonly canAdvanceDialogue: boolean;
  readonly advanceButtonLabel: string | null;

  handleEvent(
    snapshot: GameStateSnapshot,
    event: GameEvent
  ): { nextState: IGameStateNode; nextSnapshot: GameStateSnapshot };
}
