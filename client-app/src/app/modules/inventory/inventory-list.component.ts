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
      <thead><tr><th>Product</th><th>On Hand</th><th>Reorder Level</th><th>Location</th><th>Last Restocked</th><th>Actions</th></tr></thead>
      <tbody>
        <tr *ngFor="let i of items" [class.low-stock]="i.quantityOnHand <= i.reorderLevel">
          <td>{{i.productName}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
          <td>{{i.lastRestocked | date}}</td>
          <td>
            <input type="number" [(ngModel)]="i.restockQty" min="1" placeholder="Qty" style="width:60px">
            <button (click)="restock(i)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">No inventory items found.</p>
    <h3>Low Stock Items</h3>
    <table *ngIf="lowStockItems.length">
      <thead><tr><th>Product</th><th>On Hand</th><th>Reorder Level</th><th>Location</th></tr></thead>
      <tbody>
        <tr *ngFor="let i of lowStockItems">
          <td>{{i.productName}}</td><td>{{i.quantityOnHand}}</td><td>{{i.reorderLevel}}</td><td>{{i.warehouseLocation}}</td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!lowStockItems.length">No low stock items.</p>
  `
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  lowStockItems: any[] = [];
  private apiBase = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadInventory();
    this.loadLowStock();
  }

  loadInventory() {
    this.http.get<any[]>(`${this.apiBase}/api/inventory`).subscribe(data => this.items = data.map(i => ({ ...i, restockQty: 1 })));
  }

  loadLowStock() {
    this.http.get<any[]>(`${this.apiBase}/api/inventory/low-stock`).subscribe(data => this.lowStockItems = data);
  }

  restock(item: any) {
    const qty = item.restockQty || 1;
    this.http.post(`${this.apiBase}/api/inventory/product/${item.productId}/restock`, { quantity: qty }).subscribe(() => {
      this.loadInventory();
      this.loadLowStock();
    });
  }
}
