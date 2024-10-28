import { Component, inject } from '@angular/core';
import { CardSvgComponent } from './cards-svg.component';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WebSocketService } from '../services/ws.service';
import { WebSocketClientMessage } from '../models/websocket.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CardSvgComponent, ReactiveFormsModule],
  template: `
  <div class="container">
    <div class="px-4 py-5 my-5 text-center">
      <cards-svg [svgWidth]="120" [svgHeight]="120"/>
      <h1 class="display-5 fw-bold text-body-emphasis">Card Guesser Multiplayer</h1>
      <div class="col-lg-6 mx-auto">
        <p class="lead mb-4">Get into a room with your friends and guess the card. The lower your score the better.</p>
        <form [formGroup]="form">
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
  form = new FormGroup({
    name: new FormControl(null, Validators.required)
  });

  private router = inject(Router);
  private wsService = inject(WebSocketService);

  play() {
    const wsMessage: WebSocketClientMessage = {
      action: "SET_NAME",
      payload: {
        name: this.form.value?.name
      }
    };
    this.wsService.sendMessage(wsMessage);
    this.router.navigate(['/rooms']);
  }
}
