export interface ClientMessage<K> {
  action: string;
  payload: K;
}

export interface ServerMessage<K> {
  action: string;
  status: string;
  payload: K;
}

export interface RegisterPayloadClient {
  playerId: string;
}

export interface SetNamePayload {
  name: string;
}

export interface CreateRoomPayloadClient {
  timeoutSeconds: number;
}

export interface GeneralRoomPayloadClient {
  roomId: string;
}

export interface StartGamePayload {
  roomId: string;
  gameId: string;
}

export interface MakeMovePayload {
  roomId: string;
  move: number;
}

export interface JoinRoomPayload {
  roomId: string;
  timeoutInSeconds: number;
  newPlayer: string;
  players: string[];
}

export interface PlayerResult {
  player: string;
  guess: string;
  score: number;
}

export interface EndGamePayload {
  roomId: string;
  gameId: string;
  target: string;
  results: PlayerResult[];
}