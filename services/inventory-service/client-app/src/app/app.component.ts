import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="navbar navbar-expand navbar-dark bg-primary mb-4">
      <div class="container">
        <a class="navbar-brand" routerLink="/">Inventory Service</a>
        <ul class="navbar-nav">
          <li class="nav-item"><a class="nav-link" routerLink="/inventory">Inventory</a></li>
          <li class="nav-item"><a class="nav-link" routerLink="/low-stock">Low Stock</a></li>
        </ul>
      </div>
    </nav>
    <div class="container"><router-outlet /></div>
  `
})
export class AppComponent {}
