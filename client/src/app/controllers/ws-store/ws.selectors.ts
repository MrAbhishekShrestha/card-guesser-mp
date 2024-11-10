import { createFeatureSelector, createSelector } from "@ngrx/store";
import { WebSocketGameState } from "./ws.states";

export const selectWebSocketFeature = createFeatureSelector<WebSocketGameState>('websocket');
export const selectWSGameState = createSelector(selectWebSocketFeature, state => state.gameState);
export const selectPlayerName = createSelector(selectWSGameState, state => state.playerName);
export const selectJoinedRoom = createSelector(selectWSGameState, state => state.joinedRoom);
export const selectCurrentGame = createSelector(selectJoinedRoom, state => state?.newGame);