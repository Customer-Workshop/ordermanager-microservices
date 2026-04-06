import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, InventoryItem } from './inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 1rem;">
      <h2>Inventory Items</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 8px; border: 1px solid #ddd;">Product ID</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Product Name</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Reorder Level</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Location</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Last Restocked</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items" [style.background]="item.quantityOnHand <= item.reorderLevel ? '#fff3cd' : 'white'">
            <td style="padding: 8px; border: 1px solid #ddd;">{{ item.productId }}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{{ item.productName }}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{{ item.quantityOnHand }}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{{ item.reorderLevel }}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{{ item.warehouseLocation }}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{{ item.lastRestocked | date:'short' }}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">
              <input type="number" [(ngModel)]="restockQuantity" min="1" style="width: 60px;" />
              <button (click)="restock(item.productId)" style="margin-left: 4px;">Restock</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  restockQuantity = 10;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.inventoryService.getAll().subscribe(items => this.items = items);
  }

  restock(productId: number): void {
    this.inventoryService.restock(productId, this.restockQuantity).subscribe(() => this.loadItems());
  }
}
