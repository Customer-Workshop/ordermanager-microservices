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
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product</th>
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
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
          <td>{{i.lastRestocked | date}}</td>
          <td>
            <input type="number" [(ngModel)]="restockQty" min="1" placeholder="Qty" style="width:60px">
            <button (click)="restock(i.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="!items.length">No inventory items found.</div>

    <h3>Low Stock Items</h3>
    <ul>
      <li *ngFor="let i of lowStockItems">
        {{i.productName}} - {{i.quantityOnHand}} remaining (reorder level: {{i.reorderLevel}})
      </li>
    </ul>
    <div *ngIf="!lowStockItems.length">No low stock items.</div>
  `
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  lowStockItems: any[] = [];
  restockQty = 10;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadInventory();
    this.loadLowStock();
  }

  loadInventory() {
    this.http.get<any[]>('/api/inventory').subscribe(data => this.items = data);
  }

  loadLowStock() {
    this.http.get<any[]>('/api/inventory/low-stock').subscribe(data => this.lowStockItems = data);
  }

  restock(productId: number) {
    this.http.post(`/api/inventory/product/${productId}/restock`, { quantity: this.restockQty })
      .subscribe(() => {
        this.loadInventory();
        this.loadLowStock();
      });
  }
}
