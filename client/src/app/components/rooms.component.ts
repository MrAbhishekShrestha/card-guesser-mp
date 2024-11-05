import { Component } from '@angular/core';

@Component({
  selector: 'app-rooms',
  standalone: true,
  template: `
  <div class="container">
    <div class="d-flex justify-content-center gap-3">
      <div class="card p-cursor" style="width: 18rem;">
        <div class="card-body d-flex justify-content-center align-items-center">
          <h5 class="card-title text-center">Create Room</h5>
        </div>
      </div>
      <div class="card p-cursor" style="width: 18rem;">
        <div class="card-body d-flex justify-content-center align-items-center">
          <h5 class="card-title text-center">Join Room</h5>
        </div>
      </div>
    </div>
  </div>  
  `,
  styles: [`
    .card-body {
      height: 10rem;
    }

    .p-cursor {
      cursor: pointer;
    }
  `]
})
export class RoomsComponent {
}
