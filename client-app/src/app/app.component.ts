import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav style="padding: 1rem; background: #1976d2; color: white;">
      <a routerLink="/inventory" style="color: white; margin-right: 1rem;">Inventory</a>
      <a routerLink="/low-stock" style="color: white;">Low Stock</a>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'Inventory Service';
}
