import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductApiService } from './product.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Add Product</h2>
    <form (ngSubmit)="submit()">
      <p><label>Name <input [(ngModel)]="name" name="name" required></label></p>
      <p><label>Description <input [(ngModel)]="description" name="description"></label></p>
      <p><label>Category <input [(ngModel)]="category" name="category"></label></p>
      <p><label>Price <input type="number" min="0" step="0.01" [(ngModel)]="price" name="price" required></label></p>
      <p><label>SKU <input [(ngModel)]="sku" name="sku" required></label></p>
      <button type="submit">Create</button>
    </form>
    <p *ngIf="error" class="error">{{error}}</p>
  `
})
export class ProductCreateComponent {
  name = '';
  description = '';
  category = '';
  price = 0;
  sku = '';
  error = '';

  constructor(private api: ProductApiService, private router: Router) {}

  submit() {
    this.error = '';
    this.api.create({
      name: this.name,
      description: this.description,
      category: this.category,
      price: this.price,
      sku: this.sku
    }).subscribe({
      next: () => this.router.navigate(['/products']),
      error: err => this.error = err.error?.error ?? 'Failed to create product.'
    });
  }
}
