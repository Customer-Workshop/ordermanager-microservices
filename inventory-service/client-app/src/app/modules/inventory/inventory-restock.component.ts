import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inventory-restock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Restock Inventory</h2>
    <div class="restock-form">
      <label>Product ID: <input type="number" [(ngModel)]="productId" /></label>
      <label>Quantity: <input type="number" [(ngModel)]="quantity" /></label>
      <button (click)="restock()">Restock</button>
    </div>
    <div *ngIf="message" class="message">{{ message }}</div>
  `
})
export class InventoryRestockComponent {
  productId = 0;
  quantity = 0;
  message = '';

  constructor(private http: HttpClient) {}

  restock() {
    this.http.post<any>(`${environment.apiUrl}/api/inventory/product/${this.productId}/restock`, { quantity: this.quantity })
      .subscribe({
        next: (data) => this.message = `Restocked product ${data.productName}. New quantity: ${data.quantityOnHand}`,
        error: (err) => this.message = `Error: ${err.error?.error || err.message}`
      });
  }
}
