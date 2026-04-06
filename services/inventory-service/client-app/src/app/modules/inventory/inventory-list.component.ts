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
    <div style="margin-bottom: 16px;">
      <button class="btn-restock" (click)="showLowStock = !showLowStock">
        {{ showLowStock ? 'Show All' : 'Show Low Stock' }}
      </button>
    </div>
    <table *ngIf="displayItems.length">
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
        <tr *ngFor="let item of displayItems" [class.low-stock]="item.quantityOnHand <= item.reorderLevel">
          <td>{{ item.productName }}</td>
          <td>{{ item.sku }}</td>
          <td>{{ item.quantityOnHand }}</td>
          <td>{{ item.reorderLevel }}</td>
          <td>{{ item.warehouseLocation }}</td>
          <td>{{ item.lastRestocked | date }}</td>
          <td>
            <button class="btn-restock" (click)="restock(item.productId)">Restock +10</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!displayItems.length">No inventory items found.</p>
  `
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  lowStockItems: any[] = [];
  showLowStock = false;

  get displayItems(): any[] {
    return this.showLowStock ? this.lowStockItems : this.items;
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.http.get<any[]>('/api/inventory').subscribe(data => this.items = data);
    this.http.get<any[]>('/api/inventory/low-stock').subscribe(data => this.lowStockItems = data);
  }

  restock(productId: number) {
    this.http.post(`/api/inventory/product/${productId}/restock`, { quantity: 10 })
      .subscribe(() => this.loadInventory());
  }
}
