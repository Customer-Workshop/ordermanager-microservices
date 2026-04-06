import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav style="padding: 1rem; background: #1976d2; color: white;">
      <h2 style="margin: 0; display: inline;">Inventory Service</h2>
      <a routerLink="/" style="color: white; margin-left: 2rem;">All Inventory</a>
      <a routerLink="/low-stock" style="color: white; margin-left: 1rem;">Low Stock</a>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}
