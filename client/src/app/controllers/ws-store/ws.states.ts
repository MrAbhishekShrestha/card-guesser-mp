import { PlayerResult } from "../../models/websocket.model";

interface NewGame {
  id: string;
  move: number | null;
  status: string;
  target: string | null;
  results: PlayerResult[];
}

interface JoinedRoom {
  id: string;
  players: string[];
  timeoutInSeconds: number;
  status: string;
  newGame: NewGame | null;
}

interface GameState {
  playerId: string | null;
  playerName: string | null;
  createRoomId: string | null;
  joinedRoom: JoinedRoom | null;
}

export interface WebSocketGameState {
  isConnected: boolean;
  gameState: GameState;
}

const initGameState: GameState = {
  playerId: null,
  playerName: null,
  createRoomId: null,
  joinedRoom: null,
}

export const initState: WebSocketGameState = {
  isConnected: false,
  gameState: initGameState
};