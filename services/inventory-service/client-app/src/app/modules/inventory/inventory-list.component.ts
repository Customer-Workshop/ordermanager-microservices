import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Inventory Management</h2>
    <div style="margin-bottom: 1rem;">
      <button (click)="loadAll()">All Items</button>
      <button (click)="loadLowStock()" style="margin-left: 0.5rem;">Low Stock Only</button>
    </div>
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
          <td>{{i.productName}}</td>
          <td>{{i.sku}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
          <td>{{i.lastRestocked | date}}</td>
          <td>
            <input type="number" [(ngModel)]="restockQuantities[i.productId]" placeholder="Qty" style="width: 60px; margin-right: 4px;">
            <button (click)="restock(i.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">No inventory items found.</p>
  `
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  restockQuantities: { [key: number]: number } = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.http.get<any[]>('/api/inventory').subscribe(data => this.items = data);
  }

  loadLowStock() {
    this.http.get<any[]>('/api/inventory/low-stock').subscribe(data => this.items = data);
  }

  restock(productId: number) {
    const qty = this.restockQuantities[productId];
    if (!qty || qty <= 0) return;
    this.http.post(`/api/inventory/product/${productId}/restock`, { quantity: qty })
      .subscribe(() => {
        this.restockQuantities[productId] = 0;
        this.loadAll();
      });
  }
}
