export interface ClientMessage<K> {
  action: string;
  payload: K;
}

export interface ServerMessage<K> {
  action: string;
  status: string;
  payload: K;
}

export type ServerPayloads = RegisterPayload | CreateRoomPayload;

export interface RegisterPayload {
  playerId: string;
}

export interface SetNamePayload {
  name: string;
}

export interface CreateRoomPayload {
  timeoutSeconds: number;
}