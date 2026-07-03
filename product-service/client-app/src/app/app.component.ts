import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <h1>Product Service</h1>
      <a routerLink="/products">Products</a>
      <a routerLink="/products/new">Add Product</a>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'ProductService';
}
