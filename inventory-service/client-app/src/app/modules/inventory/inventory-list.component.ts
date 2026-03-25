import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  quantityOnHand: number;
  reorderLevel: number;
  warehouseLocation: string;
  lastRestocked: string;
}

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Inventory Management</h2>
    <div style="margin-bottom: 16px;">
      <button (click)="loadAll()">All Items</button>
      <button (click)="loadLowStock()" style="margin-left: 8px; background: #e65100;">Low Stock</button>
    </div>
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product</th>
          <th>Product ID</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let i of items" [class.low-stock]="i.quantityOnHand <= i.reorderLevel">
          <td>{{i.productName}}</td>
          <td>{{i.productId}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
          <td>{{i.lastRestocked | date}}</td>
          <td>
            <input type="number" [(ngModel)]="restockQuantities[i.productId]" min="1" placeholder="Qty" style="width: 60px; margin-right: 4px;">
            <button (click)="restock(i.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">No inventory items found.</p>
  `
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  restockQuantities: { [key: number]: number } = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.http.get<InventoryItem[]>('/api/inventory').subscribe(data => this.items = data);
  }

  loadLowStock() {
    this.http.get<InventoryItem[]>('/api/inventory/low-stock').subscribe(data => this.items = data);
  }

  restock(productId: number) {
    const quantity = this.restockQuantities[productId] || 0;
    if (quantity <= 0) return;
    this.http.post<InventoryItem>(`/api/inventory/product/${productId}/restock`, { quantity })
      .subscribe(() => {
        this.restockQuantities[productId] = 0;
        this.loadAll();
      });
  }
}
