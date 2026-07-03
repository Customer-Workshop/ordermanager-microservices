import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductApiService } from './product.service';
import { Product } from './product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Products</h2>
    <label>
      Filter by category:
      <input [(ngModel)]="category" placeholder="e.g. Widgets">
      <button (click)="load()">Apply</button>
    </label>
    <table *ngIf="products.length">
      <thead>
        <tr><th>SKU</th><th>Name</th><th>Description</th><th>Category</th><th>Price</th><th>Created</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of products">
          <td>{{p.sku}}</td>
          <td>{{p.name}}</td>
          <td>{{p.description}}</td>
          <td>{{p.category}}</td>
          <td>{{p.price | currency}}</td>
          <td>{{p.createdAt | date}}</td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!products.length">No products found.</p>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  category = '';

  constructor(private api: ProductApiService) {}

  ngOnInit() { this.load(); }

  load() {
    const source = this.category.trim()
      ? this.api.getByCategory(this.category.trim())
      : this.api.getAll();
    source.subscribe(data => this.products = data);
  }
}
