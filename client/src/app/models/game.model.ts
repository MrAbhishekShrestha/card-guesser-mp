export interface GameState {
  playerId: string | null;
  playerName: string | null;
  roomId: string | null;
}

export const initGameState: GameState = {
  playerId: null,
  playerName: null,
  roomId: null
}