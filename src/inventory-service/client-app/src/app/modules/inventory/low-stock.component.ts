import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryApiService, InventoryItem } from '../shared/inventory.service';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h2>Low Stock Alerts</h2>
      <div class="alert alert-warning" *ngIf="items.length">
        {{items.length}} item(s) at or below reorder level — action required.
      </div>
      <p *ngIf="!items.length" style="color: #2e7d32; font-weight: 500;">
        All items are above their reorder levels. No action needed.
      </p>
      <table *ngIf="items.length">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>On Hand</th>
            <th>Reorder Level</th>
            <th>Deficit</th>
            <th>Location</th>
            <th>Last Restocked</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items" class="low-stock">
            <td>{{item.productName}}</td>
            <td>{{item.sku}}</td>
            <td><strong>{{item.quantityOnHand}}</strong></td>
            <td>{{item.reorderLevel}}</td>
            <td>
              <span class="badge badge-danger">-{{item.reorderLevel - item.quantityOnHand}}</span>
            </td>
            <td>{{item.warehouseLocation}}</td>
            <td>{{item.lastRestocked | date:'short'}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class LowStockComponent implements OnInit {
  items: InventoryItem[] = [];
  constructor(private inventoryService: InventoryApiService) {}
  ngOnInit() {
    this.inventoryService.getLowStock().subscribe(data => this.items = data);
  }
}
