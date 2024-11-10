import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CardSvgComponent } from './cards-svg.component';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { WebSocketGameState } from '../controllers/ws-store/ws.states';
import { sendSetName } from '../controllers/ws-store/ws.actions';
import { ClientMessage, SetNamePayload } from '../models/websocket.model';
import { selectPlayerName } from '../controllers/ws-store/ws.selectors';
import { map, tap } from 'rxjs/operators';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardSvgComponent, ReactiveFormsModule, NgIf, AsyncPipe],
  template: `
  <div class="container">
    <div class="px-4 py-5 my-5 text-center">
      <cards-svg [svgWidth]="120" [svgHeight]="120"/>
      <h1 class="display-5 fw-bold text-body-emphasis">Card Guesser Multiplayer</h1>
      <div class="col-lg-6 mx-auto">
        <p class="lead mb-4">Get into a room with your friends and guess the card. The closer your guess the lower your score.</p>
        <form [formGroup]="form" *ngIf="name$ | async">
          <div class="mb-3">
            <input type="text" class="form-control" id="profileName" formControlName="name" placeholder="Enter name"/>
          </div>
        </form>
        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
          <button type="button" class="btn btn-primary btn-lg px-4 gap-3" (click)="play()" [disabled]="form.invalid">Play</button>
        </div>
      </div>
    </div>
  </div>  
  `,
  styles: [`
  `]
})
export class HomeComponent {
  private router = inject(Router);
  private store = inject(Store<WebSocketGameState>);
  form = new FormGroup({ name: new FormControl('', Validators.required) });
  name$ = this.store.select(selectPlayerName).pipe(
    tap(n => this.form.patchValue({ name: n })),
    map(n => ({ name: n }))
  );

  play(): void {
    const message: ClientMessage<SetNamePayload> = {
      action: "SET_NAME",
      payload: { name: this.form.value?.name ?? "" }
    };
    this.store.dispatch(sendSetName({ message }));
    this.router.navigate(['/rooms']);
  }
}
