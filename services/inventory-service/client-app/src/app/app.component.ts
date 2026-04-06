import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <h1>Inventory Service</h1>
    <nav>
      <a routerLink="/">Inventory</a> |
      <a routerLink="/low-stock">Low Stock</a>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'inventory-client';
}
