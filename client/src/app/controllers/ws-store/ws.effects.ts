import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { connectWebSocket, disconnectWebSocket, receivedCreateRoom, receivedEndGame, receivedJoinRoom, receivedRegisterPlayer, receivedStartGame, receiveMessage, sendCreateRoom, sendJoinRoom, sendMessage, sendMove, sendSetName, sendStartGame, webSocketConnected, webSocketDisconnected } from "./ws.actions";
import { tap, map, catchError } from 'rxjs/operators';
import { AppConstants, GameActions } from "../../models/app.constants";
import { ServerMessage } from "../../models/websocket.model";
import { of } from "rxjs";
import { Store } from "@ngrx/store";
import { Router } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class WebSocketEffects {
  private socket$!: WebSocketSubject<any>;
  private actions$ = inject(Actions);
  private store = inject(Store);
  private router = inject(Router);

  connectWebSocket$ = createEffect(() => this.actions$.pipe(
    ofType(connectWebSocket),
    tap(() => {
      if (!this.socket$ || this.socket$.closed) {
        const url = `${AppConstants.protocol}://${AppConstants.domain}${AppConstants.path}`
        this.socket$ = webSocket(url);
        this.socket$.pipe(
          tap((message: ServerMessage<any>) => this.store.dispatch(this.resolveReceivedMessage(message))),
          catchError(error => {
            console.error('websocket error: ', error);
            return of(disconnectWebSocket());
          })
        ).subscribe();
      }
    }),
    map(() => webSocketConnected())
  ));

  disconnectWebSocket$ = createEffect(() => this.actions$.pipe(
    ofType(disconnectWebSocket),
    tap(() => {
      if (this.socket$) {
        this.socket$.complete();
      }
    }),
    map(() => webSocketDisconnected())
  ));

  sendMessage$ = createEffect(() => this.actions$.pipe(
    ofType(sendMessage, sendSetName, sendCreateRoom, sendJoinRoom, sendStartGame, sendMove),
    tap(({ message }) => {
      if (this.socket$) {
        this.socket$.next(message);
      }
    })
  ), { dispatch: false });

  joinedRoom$ = createEffect(() => this.actions$.pipe(
    ofType(receivedJoinRoom),
    tap(({ message }) => {
      this.router.navigate(['/rooms', `${message.payload.roomId}`]);
    })
  ), { dispatch: false });

  resolveReceivedMessage(message: ServerMessage<any>) {
    switch (message.action) {
      case GameActions.REGISTER: {
        return receivedRegisterPlayer({ message });
      }
      case GameActions.CREATE_ROOM: {
        return receivedCreateRoom({ message });
      }
      case GameActions.JOIN_ROOM: {
        return receivedJoinRoom({ message });
      }
      case GameActions.START_GAME: {
        return receivedStartGame({ message });
      }
      case GameActions.END_GAME: {
        return receivedEndGame({ message });
      }
      default: {
        return receiveMessage({ message });
      }
    }
  }
}