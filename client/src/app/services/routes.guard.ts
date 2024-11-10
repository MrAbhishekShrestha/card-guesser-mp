import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { selectWSGameState } from '../controllers/ws-store/ws.selectors';

@Injectable({ providedIn: 'root' })
export class RoomsGuard implements CanActivate {
  store = inject(Store);
  router = inject(Router);

  canActivate(): Observable<boolean> {
    return this.store.select(selectWSGameState).pipe(
      map(gameState => !!gameState.playerName && !!gameState.playerId),
      take(1),
      tap(validPlayer => {
        if (!validPlayer) this.router.navigate(['/']);
      })
    );
  }
}
