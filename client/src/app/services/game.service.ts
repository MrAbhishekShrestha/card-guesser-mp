import { inject, Injectable } from "@angular/core";
import { WebSocketService } from "./ws.service";
import { GameState, initGameState } from "../models/game.model";
import { CreateRoomPayload, SetNamePayload, ClientMessage, ServerMessage, RegisterPayload } from "../models/websocket.model";
import { filter, map, tap } from "rxjs/operators";
import { Actions } from "../models/app.constants";

@Injectable({ providedIn: 'root' })
export class GameService {
  gameState: GameState = { ...initGameState };
  wsService = inject(WebSocketService)

  setPlayerName(name: string) {
    const payload: ClientMessage<SetNamePayload> = {
      action: "SET_NAME",
      payload: {
        name: name
      }
    };
    this.gameState = { ...this.gameState, playerName: name };
    this.wsService.sendMessage(payload);
    console.log(this.gameState)
  }

  createRoom(timeout: number | null) {
    timeout = timeout ?? 10;
    const payload: ClientMessage<CreateRoomPayload> = {
      action: "CREATE_ROOM",
      payload: {
        timeoutSeconds: timeout
      }
    };
    this.wsService.sendMessage(payload);
  }
}