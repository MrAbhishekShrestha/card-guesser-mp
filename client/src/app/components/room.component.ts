import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { selectCurrentGame, selectJoinedRoom } from "../controllers/ws-store/ws.selectors";
import { AsyncPipe, NgFor, NgIf } from "@angular/common";
import { sendMove, sendStartGame } from "../controllers/ws-store/ws.actions";
import { ClientMessage, GeneralRoomPayloadClient, MakeMovePayload } from "../models/websocket.model";
import { GameActions } from "../models/app.constants";
import { Card } from "../models/card.model";
import { cardBEStrToCardMapper, copyToClipboard, generateCards } from "../services/utils";
import { GameComponent } from "./game.component";
import { map } from "rxjs";

@Component({
  selector: 'app-room',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, AsyncPipe, NgFor, GameComponent],
  template: `
  <div class="container" *ngIf="room$ | async as room">
    <div class="d-flex flex-wrap justify-content-between">
      <h3>Room Details</h3>
      <button class="btn btn-success" (click)="startGame(room.id)" [disabled]="disableStart(room.status)">Start Game</button>
    </div>
    <p>Room ID: {{ room.id }} <i class="bi bi-clipboard p-cursor p-2" (click)="copy(room.id)"></i>
      <br /> Players:
    </p>
    <div class="d-flex">
      <div *ngFor="let player of room.players">
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-person-arms-up" viewBox="0 0 16 16">
          <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
          <path d="m5.93 6.704-.846 8.451a.768.768 0 0 0 1.523.203l.81-4.865a.59.59 0 0 1 1.165 0l.81 4.865a.768.768 0 0 0 1.523-.203l-.845-8.451A1.5 1.5 0 0 1 10.5 5.5L13 2.284a.796.796 0 0 0-1.239-.998L9.634 3.84a.7.7 0 0 1-.33.235c-.23.074-.665.176-1.304.176-.64 0-1.074-.102-1.305-.176a.7.7 0 0 1-.329-.235L4.239 1.286a.796.796 0 0 0-1.24.998l2.5 3.216c.317.316.475.758.43 1.204Z"/>
        </svg>
        <p class="text-center">{{ player }}</p>
      </div>
    </div>
    <app-game [roomStatus]="room.status" [results]="results$ | async" [targetCard]="target$ | async" (onGuess)="makeMove($event, room.id)" />
  </div>
  `,
  styles: [`
  .p-cursor {
    cursor: pointer;
  }
  `]
})
export class RoomComponent {
  store = inject(Store);
  deck = generateCards();
  room$ = this.store.select(selectJoinedRoom);
  results$ = this.store.select(selectCurrentGame).pipe(
    map(game => game === null ? [] : (game?.results ?? []))
  );
  target$ = this.store.select(selectCurrentGame).pipe(
    map(game => game === null ? null : (game?.target ?? null)),
    map(cardBEStrToCardMapper),
  );

  startGame(roomId: string | null): void {
    if (!roomId) return;
    const message: ClientMessage<GeneralRoomPayloadClient> = {
      action: GameActions.START_GAME,
      payload: { roomId: roomId }
    };
    this.store.dispatch(sendStartGame({ message }));
  }

  makeMove(card: Card, roomId: string) {
    if (!card) return;
    const message: ClientMessage<MakeMovePayload> = {
      action: GameActions.MOVE,
      payload: { roomId: roomId, move: card.rank }
    };
    this.store.dispatch(sendMove({ message }));
  }

  copy(roomId: string): void {
    copyToClipboard(roomId);
  }

  disableStart(status: string): boolean {
    return status === "START" || status === "WAIT";
  }
}
