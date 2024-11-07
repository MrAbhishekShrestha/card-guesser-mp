import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardSvgComponent } from './cards-svg.component';
import { HeaderComponent } from "./header.component";
import { Store } from '@ngrx/store';
import { connectWebSocket, disconnectWebSocket } from '../controllers/ws-store/ws.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CardSvgComponent, HeaderComponent],
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
