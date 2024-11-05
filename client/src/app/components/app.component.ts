import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardSvgComponent } from './cards-svg.component';
import { HeaderComponent } from "./header.component";
import { WebSocketService } from '../services/ws.service';
import { AppConstants } from '../models/app.constants';
import { SubSinkLocal } from '../services/subsink';

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
  wsService = inject(WebSocketService);

  ngOnInit(): void {
    const url = `${AppConstants.protocol}://${AppConstants.domain}${AppConstants.path}`
    this.wsService.connect(url);
  }

  ngOnDestroy(): void {
    if (this.wsService.connected) {
      this.wsService.disconnect();
    }
  }
}
