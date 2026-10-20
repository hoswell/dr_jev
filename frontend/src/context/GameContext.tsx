import {
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { GameViewController } from '../controllers/GameViewController';
import { HttpJevBackendService } from '../services/HttpJevBackendService';
import type { IJevBackendService } from '../services/IJevBackendService';
import { GameStateMachine } from '../state/GameStateMachine';
import { GameContext, type GameContextValue } from './gameContextInstance';

export interface GameProviderProps {
  readonly children: ReactNode;
  readonly backendService?: IJevBackendService;
  readonly stateMachine?: GameStateMachine;
}

/**
 * Provides the GameStateSnapshot and GameViewController to all descendant components,
 * avoiding prop drilling across the visual novel UI.
 */
export function GameProvider({
  children,
  backendService,
  stateMachine,
}: GameProviderProps) {
  const controller = useMemo(() => {
    const machine = stateMachine ?? new GameStateMachine();
    const service = backendService ?? new HttpJevBackendService();
    return new GameViewController(machine, service);
  }, [backendService, stateMachine]);

  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot
  );

  useEffect(() => {
    void controller.initializeSession();
  }, [controller]);

  const contextValue = useMemo<GameContextValue>(
    () => ({ snapshot, controller }),
    [snapshot, controller]
  );

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}
