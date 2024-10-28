import { Component } from '@angular/core';
import { CardSvgComponent } from './cards-svg.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CardSvgComponent, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="container">
    <header class="d-flex justify-content-between py-3  mb-4 border-bottom">
      <a routerLink="/" routerLinkActive="active" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
        <cards-svg [svgWidth]="50" [svgHeight]="50"/>
        <span class="fs-4">Card Guesser</span>
      </a>
      <ul class="nav nav-pills">
        <li class="nav-item"><a routerLink="/rooms" class="nav-link" routerLinkActive="active" ariaCurrentWhenActive="page">Rooms</a></li>
      </ul>
    </header>
  </div>  
  `,
  styles: []
})
export class HeaderComponent {
  title = 'card-guesser';
}
