import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, InventoryItem } from './inventory.service';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 1rem;">
      <h2>Low Stock Items</h2>
      <div *ngIf="items.length === 0" style="padding: 1rem; color: green;">All items are adequately stocked.</div>
      <table *ngIf="items.length > 0" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #fff3cd;">
            <th style="padding: 8px; border: 1px solid #ddd;">Product Name</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Current Stock</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Reorder Level</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Location</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items" style="background: #fff3cd;">
            <td style="padding: 8px; border: 1px solid #ddd;">{{ item.productName }}</td>
            <td style="padding: 8px; border: 1px solid #ddd; color: red; font-weight: bold;">{{ item.quantityOnHand }}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{{ item.reorderLevel }}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{{ item.warehouseLocation }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class LowStockComponent implements OnInit {
  items: InventoryItem[] = [];

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.inventoryService.getLowStock().subscribe(items => this.items = items);
  }
}
