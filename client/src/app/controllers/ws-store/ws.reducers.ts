import { createReducer, on } from "@ngrx/store";
import { initState } from "./ws.states";
import { receivedRegisterPlayer, sendSetName, webSocketConnected, webSocketDisconnected } from "./ws.actions";

export const websocketReducer = createReducer(
  initState,
  on(webSocketConnected, (state) => ({ ...state, isConnected: true })),
  on(webSocketDisconnected, (state) => ({ ...state, isConnected: false })),
  on(receivedRegisterPlayer, (state, action) => ({
    ...state, gameState: {
      ...state.gameState, playerId: action.message.payload.playerId
    }
  })),
  on(sendSetName, (state, action) => ({
    ...state, gameState: {
      ...state.gameState, playerName: action.message.payload.name
    }
  })),
);