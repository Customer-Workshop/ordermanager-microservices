import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryApiService } from './inventory.service';
import { InventoryItem } from './inventory.model';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Low Stock Items</h2>
    <p *ngIf="!items.length">No items below reorder level.</p>
    <table *ngIf="items.length">
      <thead>
        <tr><th>Product</th><th>SKU</th><th>On Hand</th><th>Reorder Level</th><th>Location</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let i of items">
          <td>{{i.productName}}</td>
          <td>{{i.sku}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
        </tr>
      </tbody>
    </table>
  `
})
export class LowStockComponent implements OnInit {
  items: InventoryItem[] = [];

  constructor(private api: InventoryApiService) {}

  ngOnInit() {
    this.api.getLowStock().subscribe(data => this.items = data);
  }
}
