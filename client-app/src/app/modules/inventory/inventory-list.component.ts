import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Inventory</h2>
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let i of items" [class.low-stock]="i.quantityOnHand <= i.reorderLevel">
          <td>{{i.product?.name}}</td>
          <td>{{i.product?.sku}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
          <td>{{i.lastRestocked | date}}</td>
          <td>
            <input type="number" [(ngModel)]="restockQuantities[i.productId]" min="1" placeholder="Qty" style="width:60px">
            <button (click)="restock(i.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">No inventory items found.</p>
    <p *ngIf="message" [class.error]="isError">{{message}}</p>
  `,
  styles: [`
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
    .low-stock { background-color: #ffe0e0; }
    .error { color: red; }
    input { margin-right: 4px; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  restockQuantities: { [productId: number]: number } = {};
  message = '';
  isError = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.http.get<any[]>(`${environment.apiUrl}/api/inventory`).subscribe({
      next: data => this.items = data,
      error: () => { this.message = 'Failed to load inventory'; this.isError = true; }
    });
  }

  restock(productId: number) {
    const quantity = this.restockQuantities[productId];
    if (!quantity || quantity < 1) return;
    this.http.post(`${environment.apiUrl}/api/inventory/product/${productId}/restock`, { quantity }).subscribe({
      next: () => { this.message = 'Restocked successfully'; this.isError = false; this.loadInventory(); },
      error: () => { this.message = 'Failed to restock'; this.isError = true; }
    });
  }
}
