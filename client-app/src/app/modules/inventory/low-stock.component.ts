import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Low Stock Alerts</h2>
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let i of items" class="low-stock">
          <td>{{i.productName}}</td>
          <td>{{i.productSku}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
          <td>
            <div class="restock-form">
              <input type="number" [(ngModel)]="restockQuantities[i.productId]" placeholder="Qty" min="1">
              <button (click)="restock(i.productId)">Restock</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">All items are sufficiently stocked.</p>
  `
})
export class LowStockComponent implements OnInit {
  items: any[] = [];
  restockQuantities: { [key: number]: number } = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.http.get<any[]>(`${environment.apiUrl}/api/inventory/low-stock`).subscribe(data => this.items = data);
  }

  restock(productId: number) {
    const qty = this.restockQuantities[productId];
    if (!qty || qty <= 0) return;
    this.http.post(`${environment.apiUrl}/api/inventory/product/${productId}/restock`, { quantity: qty })
      .subscribe(() => {
        this.restockQuantities[productId] = 0;
        this.loadItems();
      });
  }
}
