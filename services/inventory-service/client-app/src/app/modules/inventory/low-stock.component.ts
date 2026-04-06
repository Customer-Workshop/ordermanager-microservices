import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, InventoryItem } from './inventory.service';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 1rem;">
      <h3>Low Stock Items</h3>
      <p *ngIf="items.length === 0">No low stock items found.</p>
      <table *ngIf="items.length > 0" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #fff3e0;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e65100;">Product</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e65100;">SKU</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e65100;">Qty On Hand</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e65100;">Reorder Level</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e65100;">Location</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items" style="background: #fff3e0;">
            <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ item.product?.name }}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ item.product?.sku }}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; color: #e65100; font-weight: bold;">{{ item.quantityOnHand }}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">{{ item.reorderLevel }}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ item.warehouseLocation }}</td>
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
