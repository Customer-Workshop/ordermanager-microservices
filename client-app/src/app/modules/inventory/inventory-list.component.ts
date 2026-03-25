import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryItem } from './inventory.model';
import { InventoryService } from './inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="stats">
      <div class="card">
        <div class="stat-value">{{items.length}}</div>
        <div class="stat-label">Total Items</div>
      </div>
      <div class="card">
        <div class="stat-value">{{totalStock}}</div>
        <div class="stat-label">Total Units in Stock</div>
      </div>
      <div class="card">
        <div class="stat-value">{{lowStockCount}}</div>
        <div class="stat-label">Low Stock Alerts</div>
      </div>
    </div>

    <h2>All Inventory Items</h2>
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product ID</th>
          <th>Product</th>
          <th>Product ID</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
          <th>Status</th>
          <th>Restock</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items" [class.low-stock]="item.quantityOnHand <= item.reorderLevel">
          <td>{{item.productName}}</td>
          <td>{{item.productId}}</td>
          <td>{{item.quantityOnHand}}</td>
          <td>{{item.reorderLevel}}</td>
          <td>{{item.warehouseLocation}}</td>
          <td>{{item.lastRestocked | date:'medium'}}</td>
          <td>
            <span class="badge" [class.badge-warning]="item.quantityOnHand <= item.reorderLevel" [class.badge-success]="item.quantityOnHand > item.reorderLevel">
              {{item.quantityOnHand <= item.reorderLevel ? 'Low Stock' : 'In Stock'}}
            </span>
          </td>
          <td>
            <input type="number" [(ngModel)]="restockQuantities[item.productId]" min="1" placeholder="Qty">
            <button (click)="restock(item.productId)" [disabled]="!restockQuantities[item.productId] || restockQuantities[item.productId] < 1">
              Restock
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length && !loading">No inventory items found.</p>
    <p *ngIf="loading">Loading...</p>
  `
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  restockQuantities: { [productId: number]: number } = {};
  loading = true;

  get totalStock(): number {
    return this.items.reduce((sum, item) => sum + item.quantityOnHand, 0);
  }

  get lowStockCount(): number {
    return this.items.filter(item => item.quantityOnHand <= item.reorderLevel).length;
  }

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.inventoryService.getAll().subscribe({
      next: data => {
        this.items = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  restock(productId: number): void {
    const quantity = this.restockQuantities[productId];
    if (!quantity || quantity < 1) return;

    this.inventoryService.restock(productId, quantity).subscribe({
      next: () => {
        this.restockQuantities[productId] = 0;
        this.loadItems();
      }
    });
  }
}
