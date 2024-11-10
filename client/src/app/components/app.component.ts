import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header.component";
import { Store } from '@ngrx/store';
import { connectWebSocket, disconnectWebSocket } from '../controllers/ws-store/ws.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <app-header />
  <router-outlet />
  `,
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {
  store = inject(Store)

  ngOnInit() {
    this.store.dispatch(connectWebSocket());
  }

  ngOnDestroy() {
    this.store.dispatch(disconnectWebSocket());
  }
}
