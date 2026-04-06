import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, InventoryItem } from './inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 1rem;">
      <h3>Inventory Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">SKU</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Qty On Hand</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Reorder Level</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Location</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items" [style.background]="item.quantityOnHand <= item.reorderLevel ? '#fff3e0' : 'transparent'">
            <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ item.product?.name }}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ item.product?.sku }}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">{{ item.quantityOnHand }}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">{{ item.reorderLevel }}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ item.warehouseLocation }}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              <span *ngIf="item.quantityOnHand <= item.reorderLevel" style="color: #e65100; font-weight: bold;">LOW STOCK</span>
              <span *ngIf="item.quantityOnHand > item.reorderLevel" style="color: #2e7d32;">In Stock</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.inventoryService.getAll().subscribe(items => this.items = items);
  }
}
