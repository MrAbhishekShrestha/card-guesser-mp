import { createAction, props } from "@ngrx/store";
import { ClientMessage, GeneralRoomPayloadClient, CreateRoomPayloadClient, RegisterPayloadClient, ServerMessage, SetNamePayload, JoinRoomPayload, StartGamePayload, MakeMovePayload, EndGamePayload } from "../../models/websocket.model";

const src = `[WebSocket]`;
const srcRcv = `[WebSocket: Receive]`;
const srcSnd = `[WebSocket: Send]`;

export const connectWebSocket = createAction(`${src} Connect`);
export const disconnectWebSocket = createAction(`${src} Disconnect`);
export const webSocketConnected = createAction(`${src} Connected`);
export const webSocketDisconnected = createAction(`${src} Disconnected`);
export const sendMessage = createAction(`${src} Send Message`, props<{ message: ClientMessage<any> }>());
export const receiveMessage = createAction(`${src} Receive Message`, props<{ message: ServerMessage<any> }>());
export const sendSetName = createAction(`${srcSnd} Set Name`, props<{ message: ClientMessage<SetNamePayload> }>());
export const receivedRegisterPlayer = createAction(`${srcRcv} Register Player`, props<{ message: ServerMessage<RegisterPayloadClient> }>());
export const sendCreateRoom = createAction(`${srcSnd} Create Room`, props<{ message: ClientMessage<CreateRoomPayloadClient> }>());
export const receivedCreateRoom = createAction(`${srcRcv} Create Room Success`, props<{ message: ServerMessage<GeneralRoomPayloadClient> }>());
export const sendJoinRoom = createAction(`${srcSnd} Join Room`, props<{ message: ClientMessage<GeneralRoomPayloadClient> }>());
export const receivedJoinRoom = createAction(`${srcRcv} Join Room Success`, props<{ message: ServerMessage<JoinRoomPayload> }>());
export const sendStartGame = createAction(`${srcSnd} Start Game`, props<{ message: ClientMessage<GeneralRoomPayloadClient> }>());
export const receivedStartGame = createAction(`${srcRcv} Start Game`, props<{ message: ClientMessage<StartGamePayload> }>());
export const sendMove = createAction(`${srcSnd} Move`, props<{ message: ClientMessage<MakeMovePayload> }>());
export const receivedEndGame = createAction(`${srcRcv} End Game`, props<{ message: ServerMessage<EndGamePayload> }>());
