export interface WebSocketClientMessage {
  action: string;
  payload: { [key: string]: any };
}