import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryApiService } from './inventory.service';
import { InventoryItem } from './inventory.model';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Inventory</h2>
    <table *ngIf="items.length">
      <thead>
        <tr><th>Product</th><th>SKU</th><th>On Hand</th><th>Reorder Level</th><th>Location</th><th>Last Restocked</th><th>Restock</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let i of items" [class.low-stock]="i.quantityOnHand <= i.reorderLevel">
          <td>{{i.productName}}</td>
          <td>{{i.sku}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
          <td>{{i.lastRestocked | date}}</td>
          <td>
            <input type="number" min="1" [(ngModel)]="restockQty[i.productId]" placeholder="Qty" style="width:60px">
            <button (click)="restock(i.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  restockQty: Record<number, number> = {};

  constructor(private api: InventoryApiService) {}

  ngOnInit() { this.load(); }

  load() { this.api.getAll().subscribe(data => this.items = data); }

  restock(productId: number) {
    const qty = this.restockQty[productId];
    if (!qty || qty < 1) return;
    this.api.restock(productId, qty).subscribe(() => {
      this.restockQty[productId] = 0;
      this.load();
    });
  }
}
