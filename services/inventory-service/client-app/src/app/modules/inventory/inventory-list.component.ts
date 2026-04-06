import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryApiService, InventoryItem } from './inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inventory-container">
      <h2>Inventory Management</h2>

      <div class="filters">
        <button (click)="loadAll()" [class.active]="!showLowStock">All Items</button>
        <button (click)="loadLowStock()" [class.active]="showLowStock">Low Stock</button>
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
          <tr *ngFor="let item of items" [class.low-stock]="item.quantityOnHand <= item.reorderLevel">
            <td>{{ item.productName }}</td>
            <td>{{ item.sku }}</td>
            <td>{{ item.quantityOnHand }}</td>
            <td>{{ item.reorderLevel }}</td>
            <td>{{ item.warehouseLocation }}</td>
            <td>{{ item.lastRestocked | date:'short' }}</td>
            <td>
              <input type="number" [(ngModel)]="restockQuantities[item.productId]" min="1" placeholder="Qty" class="restock-input" />
              <button (click)="restock(item.productId)" class="restock-btn">Restock</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p *ngIf="!items.length && !loading">No inventory items found.</p>
      <p *ngIf="loading">Loading...</p>
    </div>
  `,
  styles: [`
    .inventory-container { padding: 20px; }
    .filters { margin-bottom: 16px; }
    .filters button { margin-right: 8px; padding: 8px 16px; cursor: pointer; }
    .filters button.active { background: #007bff; color: white; border: none; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f5f5f5; font-weight: 600; }
    .low-stock { background-color: #fff3cd; }
    .restock-input { width: 60px; margin-right: 8px; padding: 4px; }
    .restock-btn { padding: 4px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  loading = false;
  showLowStock = false;
  restockQuantities: { [productId: number]: number } = {};

  constructor(private inventoryService: InventoryApiService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.showLowStock = false;
    this.loading = true;
    this.inventoryService.getAll().subscribe({
      next: data => { this.items = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadLowStock() {
    this.showLowStock = true;
    this.loading = true;
    this.inventoryService.getLowStock().subscribe({
      next: data => { this.items = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  restock(productId: number) {
    const qty = this.restockQuantities[productId];
    if (!qty || qty <= 0) return;
    this.inventoryService.restock(productId, qty).subscribe({
      next: () => {
        this.restockQuantities[productId] = 0;
        this.showLowStock ? this.loadLowStock() : this.loadAll();
      }
    });
  }
}
