import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './inventory.model';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Inventory</h2>
    <div class="actions">
      <button (click)="loadAll()">All Items</button>
      <button (click)="loadLowStock()">Low Stock</button>
    </div>
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
        <tr *ngFor="let item of items" [class.low-stock]="item.quantityOnHand <= item.reorderLevel">
          <td>{{item.productName}}</td>
          <td>{{item.quantityOnHand}}</td>
          <td>{{item.reorderLevel}}</td>
          <td>{{item.warehouseLocation}}</td>
          <td>{{item.lastRestocked | date}}</td>
          <td>
            <input type="number" [(ngModel)]="restockQuantities[item.productId]" placeholder="Qty" min="1" style="width:60px" />
            <button (click)="restock(item.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">No inventory items found.</p>
  `
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
    const qty = this.restockQuantities[productId];
    if (qty && qty > 0) {
      this.inventoryService.restock(productId, qty).subscribe(() => {
        this.restockQuantities[productId] = 0;
        this.loadAll();
      });
    }
  }
}
