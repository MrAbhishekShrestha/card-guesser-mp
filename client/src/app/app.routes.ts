import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { RoomsComponent } from './components/rooms.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'rooms', component: RoomsComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
