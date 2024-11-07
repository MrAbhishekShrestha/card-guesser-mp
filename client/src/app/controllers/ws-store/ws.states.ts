interface GameState {
  playerId: string | null;
  playerName: string | null;
  roomId: string | null;
}

export interface WebSocketGameState {
  isConnected: boolean;
  gameState: GameState;
}

const initGameState: GameState = {
  playerId: null,
  playerName: null,
  roomId: null
}

export const initState: WebSocketGameState = {
  isConnected: false,
  gameState: initGameState
};