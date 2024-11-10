import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { sendCreateRoom, sendJoinRoom } from '../controllers/ws-store/ws.actions';
import { ClientMessage, CreateRoomPayloadClient, GeneralRoomPayloadClient } from '../models/websocket.model';
import { GameActions } from '../models/app.constants';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SubSinkLocal } from '../services/subsink';
import { selectWSGameState } from '../controllers/ws-store/ws.selectors';
import { tap } from 'rxjs/operators';
import { NgIf } from '@angular/common';
import { copyToClipboard } from '../services/utils';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
  <div class="container d-flex flex-column align-items-center">
    <div class="d-flex justify-content-center gap-3 mb-5 flex-wrap">
      <div class="card p-cursor" style="width: 18rem;" (click)="createRoom()">
        <div class="card-body d-flex justify-content-center align-items-center">
          <h5 class="card-title text-center">Create Room</h5>
        </div>
      </div>
      <div class="card p-cursor" style="width: 18rem;" (click)="joinRoom()">
        <div class="card-body d-flex justify-content-center align-items-center">
          <h5 class="card-title text-center">Join Room</h5>
        </div>
      </div>
    </div>
    <form [formGroup]="form" class="w-50 w-sd-75">
      <div class="mb-3 w-100" *ngIf="mode === 'create'">
        <label for="createdRoomId" class="form-label">Created Room Id</label>
        <div class="input-group">
          <input type="text" class="form-control" id="createdRoomId" formControlName="createRoomId">
          <button class="btn btn-outline-secondary" type="button" (click)="copy()">
            <i class="bi bi-clipboard"></i>
          </button>
        </div>
      </div>
      <div class="mb-3" *ngIf="mode === 'join'">
        <label for="joinedRoomId" class="form-label">Join Room Id</label>
        <input type="text" class="form-control" id="joinedRoomId" formControlName="joinRoomId">
      </div>
      <button type="button" class="btn btn-primary" *ngIf="mode === 'create' || mode === 'join'"
        (click)="join()" [disabled]="isBtnDisabled()">JOIN</button>
    </form>
  </div>
  `,
  styles: [`
    .card-body {
      height: 10rem;
    }

    .p-cursor {
      cursor: pointer;
    }

    .card:hover {
      border: 2px solid lightblue;
    }
  `]
})
export class RoomsComponent implements OnInit, OnDestroy {
  store = inject(Store)
  subs = new SubSinkLocal();
  form = new FormGroup({
    createRoomId: new FormControl({ value: '', disabled: true }),
    joinRoomId: new FormControl(''),
  });
  mode: "create" | "join" | null = null;

  ngOnInit(): void {
    this.subs.sink = this.store.select(selectWSGameState).pipe(
      tap(state => {
        if (!state) return;
        this.form.patchValue({
          createRoomId: state.createRoomId,
          joinRoomId: state.joinedRoom?.id,
        });
      })
    ).subscribe();
  }

  isBtnDisabled(): boolean {
    if (this.mode === 'create') {
      return false;
    } else if (this.mode === 'join') {
      if (!this.form.getRawValue().joinRoomId) return true;
    }
    return false;
  }

  createRoom() {
    this.mode = "create";
    const message: ClientMessage<CreateRoomPayloadClient> = {
      action: GameActions.CREATE_ROOM,
      payload: { timeoutSeconds: 10 }
    }
    this.store.dispatch(sendCreateRoom({ message }));
  }

  joinRoom() {
    this.mode = "join";
  }

  join() {
    const roomId = this.mode === 'create'
      ? this.form.getRawValue().createRoomId
      : this.form.getRawValue().joinRoomId;
    if (!roomId) return;
    const message: ClientMessage<GeneralRoomPayloadClient> = {
      action: GameActions.JOIN_ROOM,
      payload: { roomId }
    };
    this.store.dispatch(sendJoinRoom({ message }));
  }

  copy() {
    const text = this.form.getRawValue().createRoomId;
    if (!!text) copyToClipboard(text);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
