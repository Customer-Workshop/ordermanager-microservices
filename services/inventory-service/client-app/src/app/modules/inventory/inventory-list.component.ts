import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, InventoryItem } from './inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Inventory Management</h2>
    <div class="filters">
      <button (click)="loadAll()">All Items</button>
      <button (click)="loadLowStock()">Low Stock Only</button>
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
        <tr *ngFor="let item of items" [class.low-stock]="item.quantityOnHand <= item.reorderLevel">
          <td>{{ item.productName }}</td>
          <td>{{ item.productId }}</td>
          <td>{{ item.quantityOnHand }}</td>
          <td>{{ item.reorderLevel }}</td>
          <td>{{ item.warehouseLocation }}</td>
          <td>{{ item.lastRestocked | date }}</td>
          <td>
            <input type="number" [(ngModel)]="restockQuantities[item.productId]" min="1" placeholder="Qty" style="width:60px" />
            <button (click)="restock(item.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">No inventory items found.</p>
  `,
  styles: [`
    .low-stock { background-color: #ffe0e0; }
    .filters { margin-bottom: 1rem; }
    .filters button { margin-right: 0.5rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  restockQuantities: { [productId: number]: number } = {};

  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.inventoryService.getAll().subscribe(data => this.items = data);
  }

  loadLowStock() {
    this.inventoryService.getLowStock().subscribe(data => this.items = data);
  }

  restock(productId: number) {
    const qty = this.restockQuantities[productId] || 0;
    if (qty <= 0) return;
    this.inventoryService.restock(productId, qty).subscribe(() => {
      this.restockQuantities[productId] = 0;
      this.loadAll();
    });
  }
}
