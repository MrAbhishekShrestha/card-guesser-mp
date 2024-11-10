import { createReducer, on } from "@ngrx/store";
import { initState, WebSocketGameState } from "./ws.states";
import { receivedCreateRoom, receivedEndGame, receivedJoinRoom, receivedRegisterPlayer, receivedStartGame, sendMove, sendSetName, webSocketConnected, webSocketDisconnected } from "./ws.actions";
import { act } from "@ngrx/effects";

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
  on(receivedCreateRoom, (state, action) => ({
    ...state, gameState: {
      ...state.gameState, createRoomId: action.message.payload.roomId
    }
  })),
  on(receivedJoinRoom, (state, action) => {
    const isNewRoom = action.message.payload.roomId !== state.gameState.joinedRoom?.id;
    const newState: WebSocketGameState = {
      ...state, gameState: {
        ...state.gameState,
        joinedRoom: {
          id: action.message.payload.roomId,
          timeoutInSeconds: action.message.payload.timeoutInSeconds,
          players: [...action.message.payload.players],
          status: isNewRoom ? "EMPTY" : <string>state.gameState.joinedRoom?.status,
          newGame: isNewRoom ? null : state.gameState.joinedRoom?.newGame ?? null
        }
      }
    };
    return newState;
  }),
  on(receivedStartGame, (state, action) => ({
    ...state, gameState: {
      ...state.gameState,
      joinedRoom: state.gameState.joinedRoom === null
        ? null
        : {
          ...state.gameState.joinedRoom,
          status: "START",
          newGame: {
            id: action.message.payload.gameId,
            move: null,
            status: "ONGOING",
            target: null,
            results: [],
          }
        }
    }
  })),
  on(sendMove, (state, action) => ({
    ...state, gameState: {
      ...state.gameState,
      joinedRoom: state.gameState.joinedRoom === null
        ? null
        : {
          ...state.gameState.joinedRoom,
          status: "WAIT",
          newGame: {
            move: action.message.payload.move,
            status: "WAITING",
            id: state.gameState.joinedRoom.id,
            target: null,
            results: [],
          }
        }
    }
  })),
  on(receivedEndGame, (state, action) => ({
    ...state, gameState: {
      ...state.gameState,
      joinedRoom: state.gameState.joinedRoom === null
        ? null
        : {
          ...state.gameState.joinedRoom,
          status: "OVER",
          newGame: {
            move: state.gameState.joinedRoom.newGame?.move ?? null,
            id: action.message.payload.gameId,
            status: "OVER",
            target: action.message.payload.target,
            results: [...action.message.payload.results],
          }
        }
    }
  }))
);