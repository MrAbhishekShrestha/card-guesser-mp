import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { websocketReducer } from './controllers/ws-store/ws.reducers';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { WebSocketEffects } from './controllers/ws-store/ws.effects';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideStore({ websocket: websocketReducer }), provideEffects([WebSocketEffects]), provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })]
};
