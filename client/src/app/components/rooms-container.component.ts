import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-room-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `
  <router-outlet></router-outlet>
  `,
  styles: [``]
})
export class RoomsContainerComponent {

}