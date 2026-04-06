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
          <td>{{ item.lastRestocked | date }}</td>
          <td>
            <input type="number" [(ngModel)]="restockQuantities[item.productId]" placeholder="Qty" min="1" style="width:60px" />
            <button (click)="restock(item.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">No inventory items found.</p>
    <p *ngIf="message" class="message">{{ message }}</p>
  `
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  restockQuantities: { [productId: number]: number } = {};
  message = '';

  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.inventoryService.getAll().subscribe(data => this.items = data);
  }

  restock(productId: number) {
    const qty = this.restockQuantities[productId];
    if (!qty || qty <= 0) return;
    this.inventoryService.restock(productId, qty).subscribe({
      next: () => {
        this.message = `Restocked product ${productId} with ${qty} units.`;
        this.restockQuantities[productId] = 0;
        this.loadInventory();
      },
      error: (err) => this.message = `Error: ${err.error?.error || err.message}`
    });
  }
}
