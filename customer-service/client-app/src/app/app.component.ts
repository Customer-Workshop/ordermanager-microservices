import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <h1>Customer Service</h1>
      <a routerLink="/customers">Customers</a>
      <a routerLink="/customers/new">Add Customer</a>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'CustomerService';
}
