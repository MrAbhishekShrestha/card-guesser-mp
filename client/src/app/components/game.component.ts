import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { CardComponent } from "./card.component";
import { NgFor, NgIf } from "@angular/common";
import { Card } from "../models/card.model";
import { generateCards } from "../services/utils";
import { PlayerResult } from "../models/websocket.model";
import { ResultsComponent } from "./results.component";

@Component({
  selector: 'app-game',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, NgFor, NgIf, ResultsComponent],
  template: `
  @switch (roomStatus()) {
    @case ('EMPTY') { }
    @case ('START') {
      <h4>Guess the card</h4>
      <div class="d-flex gap-2 overflow-x-auto">
        <app-card [card]="car" (onGuess)="makeMove($event)" *ngFor="let car of deck"/>
      </div>
    }
    @case ('WAIT') {
      <h4>Waiting for other players...</h4>
      <p>Your Guess:</p>
      <app-card [card]="currentGuess"/>
    }
    @case ('OVER') {
      <h3 class="mt-2">Game Over</h3>
      <div class="d-flex flex-wrap justify-content-between gap-5">
        <div>
          <p>Your Guess:</p>
          <app-card [card]="currentGuess"/>
        </div>
        <div *ngIf="targetCard() as tc">
          <p>Target Card:</p>
          <app-card [card]="tc"/>
        </div>
        <div>
          <app-results [results]="results()" />
        </div>
      </div>
    }
  }
  `,
  styles: []
})
export class GameComponent {
  targetCard = input.required<Card | null>();
  roomStatus = input<string>();
  results = input<PlayerResult[] | null>();
  onGuess = output<Card>();
  deck = generateCards();
  currentGuess!: Card;

  makeMove(card: Card) {
    this.currentGuess = card;
    this.onGuess.emit(card);
  }
}