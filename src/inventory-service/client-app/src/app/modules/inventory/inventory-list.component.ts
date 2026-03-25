import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryApiService, InventoryItem } from '../shared/inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="stats">
      <div class="stat">
        <div class="number">{{items.length}}</div>
        <div class="label">Total Items</div>
      </div>
      <div class="stat">
        <div class="number">{{totalStock}}</div>
        <div class="label">Total Stock</div>
      </div>
      <div class="stat">
        <div class="number">{{lowStockCount}}</div>
        <div class="label">Low Stock Alerts</div>
      </div>
    </div>

    <div class="card">
      <h2>Inventory Items</h2>
      <table *ngIf="items.length">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>On Hand</th>
            <th>Reorder Level</th>
            <th>Status</th>
            <th>Location</th>
            <th>Last Restocked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items" [class.low-stock]="item.quantityOnHand <= item.reorderLevel">
            <td>{{item.productName}}</td>
            <td>{{item.sku}}</td>
            <td>{{item.quantityOnHand}}</td>
            <td>{{item.reorderLevel}}</td>
            <td>
              <span class="badge" [ngClass]="{
                'badge-ok': item.quantityOnHand > item.reorderLevel * 2,
                'badge-warn': item.quantityOnHand > item.reorderLevel && item.quantityOnHand <= item.reorderLevel * 2,
                'badge-danger': item.quantityOnHand <= item.reorderLevel
              }">
                {{item.quantityOnHand <= item.reorderLevel ? 'Low Stock' : item.quantityOnHand <= item.reorderLevel * 2 ? 'Warning' : 'In Stock'}}
              </span>
            </td>
            <td>{{item.warehouseLocation}}</td>
            <td>{{item.lastRestocked | date:'short'}}</td>
            <td>
              <button (click)="openRestock(item)">Restock</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="!items.length">No inventory items found.</p>
    </div>

    <div class="dialog-overlay" *ngIf="restockItem">
      <div class="dialog">
        <h3>Restock {{restockItem.productName}}</h3>
        <p>Current stock: {{restockItem.quantityOnHand}}</p>
        <label>Quantity to add:</label>
        <input type="number" [(ngModel)]="restockQuantity" min="1" />
        <div class="actions">
          <button class="cancel" (click)="restockItem = null">Cancel</button>
          <button (click)="submitRestock()">Confirm Restock</button>
        </div>
      </div>
    </div>
  `
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  restockItem: InventoryItem | null = null;
  restockQuantity = 50;

  get totalStock(): number {
    return this.items.reduce((sum, i) => sum + i.quantityOnHand, 0);
  }

  get lowStockCount(): number {
    return this.items.filter(i => i.quantityOnHand <= i.reorderLevel).length;
  }

  constructor(private inventoryService: InventoryApiService) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.inventoryService.getAll().subscribe(data => this.items = data);
  }

  openRestock(item: InventoryItem) {
    this.restockItem = item;
    this.restockQuantity = 50;
  }

  submitRestock() {
    if (this.restockItem && this.restockQuantity > 0) {
      this.inventoryService.restock(this.restockItem.productId, this.restockQuantity).subscribe(() => {
        this.restockItem = null;
        this.loadItems();
      });
    }
  }
}
