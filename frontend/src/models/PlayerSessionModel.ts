/**
 * Immutable session model holding the active backend Player ID.
 */
export class PlayerSessionModel {
  public readonly playerId: string | null;

  constructor(playerId: string | null = null) {
    this.playerId = playerId;
  }

  public get isInitialized(): boolean {
    return this.playerId !== null && this.playerId.length > 0;
  }

  public withPlayerId(playerId: string): PlayerSessionModel {
    return new PlayerSessionModel(playerId);
  }
}

