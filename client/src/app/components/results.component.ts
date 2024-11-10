import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { NgFor } from "@angular/common";
import { PlayerResult } from "../models/websocket.model";
import { cardBEStrToCardMapper, convertIntRankToStr } from "../services/utils";

@Component({
  selector: 'app-results',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor],
  template: `
  <h4>Results</h4>
  <table class="table">
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Player</th>
        <th scope="col">Guess</th>
        <th scope="col">Score</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let res of results(); let i = index">
        <th scope="row">{{ i }}</th>
        <td>{{ res.player }}</td>
        <td>{{ guessMapper(res.guess) }}</td>
        <td>{{ res.score }}</td>
      </tr>
    </tbody>
  </table>
  `,
  styles: []
})
export class ResultsComponent {
  results = input<PlayerResult[] | null>();

  guessMapper(guess: string): string {
    const card = cardBEStrToCardMapper(guess);
    if (!card) return "";
    return `${card.suit}${convertIntRankToStr(card.rank)}`
  }
}