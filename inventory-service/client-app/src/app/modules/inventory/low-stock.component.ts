import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryApiService, InventoryItem } from './inventory.service';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Low Stock Items</h2>
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let i of items" class="low-stock">
          <td>{{i.productName}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
          <td>{{i.lastRestocked | date}}</td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">All items are sufficiently stocked.</p>
  `
})
export class LowStockComponent implements OnInit {
  items: InventoryItem[] = [];

  constructor(private inventoryService: InventoryApiService) {}

  ngOnInit() {
    this.inventoryService.getLowStock().subscribe(data => this.items = data);
  }
}
