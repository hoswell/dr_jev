import { createContext } from 'react';
import type { GameViewController } from '../controllers/GameViewController';
import type { GameStateSnapshot } from '../state/IGameStateNode';

export interface GameContextValue {
  readonly snapshot: GameStateSnapshot;
  readonly controller: GameViewController;
}

export const GameContext = createContext<GameContextValue | null>(null);

