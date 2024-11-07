import { createAction, props } from "@ngrx/store";
import { ClientMessage, RegisterPayload, ServerMessage, SetNamePayload } from "../../models/websocket.model";

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
export const receivedRegisterPlayer = createAction(`${srcRcv} Register Player`, props<{ message: ServerMessage<RegisterPayload> }>());
