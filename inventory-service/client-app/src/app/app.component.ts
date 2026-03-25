import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <nav>
      <h1>Inventory Service</h1>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'Inventory Service';
}
