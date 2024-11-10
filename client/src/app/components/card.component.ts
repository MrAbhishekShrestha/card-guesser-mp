import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { Card } from "../models/card.model";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  template: `
  <div (click)="guess()" class="p-cursor c-card">
    <img [ngSrc]="card().imgSrc" height="242" width="167">
  </div>
  `,
  styles: [`
  .p-cursor {
    cursor: pointer;
    width: min-content;
  }

  .c-card:hover {
    border: 2px solid lightblue;
  }  
  `]
})
export class CardComponent {
  card = input.required<Card>();
  onGuess = output<Card>();

  guess() {
    this.onGuess.emit(this.card());
  }
}