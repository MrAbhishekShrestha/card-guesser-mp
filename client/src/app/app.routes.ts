import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { RoomsComponent } from './components/rooms.component';
import { RoomsGuard } from './services/routes.guard';
import { RoomComponent } from './components/room.component';
import { RoomsContainerComponent } from './components/rooms-container.component';

export const routes: Routes = [
  {
    path: 'rooms', component: RoomsContainerComponent, canActivate: [RoomsGuard], children: [
      { path: ':id', component: RoomComponent },
      { path: '', component: RoomsComponent, canActivate: [RoomsGuard] }
    ]
  },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '' },
];
