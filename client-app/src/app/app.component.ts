import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <nav>
      <h1>Inventory Service</h1>
      <a routerLink="/inventory">All Items</a>
      <a routerLink="/low-stock">Low Stock</a>
    </nav>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  title = 'Inventory Service';
}
