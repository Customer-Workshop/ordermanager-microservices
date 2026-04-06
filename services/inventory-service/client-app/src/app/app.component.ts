import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="container mt-4">
      <h1>Inventory Service</h1>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {}
