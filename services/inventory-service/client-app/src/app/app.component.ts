import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="navbar">
      <h1>Inventory Service</h1>
      <a routerLink="/inventory">Inventory</a>
    </nav>
    <main class="content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      background: #1a237e;
      color: white;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      gap: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .navbar h1 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 600;
    }
    .navbar a {
      color: #bbdefb;
      text-decoration: none;
      font-size: 0.95rem;
      padding: 6px 12px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .navbar a:hover { background: rgba(255,255,255,0.15); }
    .content { padding: 24px 32px; max-width: 1100px; }
  `]
})
export class AppComponent {
  title = 'Inventory Service';
}
