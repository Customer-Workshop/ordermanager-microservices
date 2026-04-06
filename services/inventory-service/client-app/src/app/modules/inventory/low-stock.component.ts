import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryApiService, InventoryItemDto } from './inventory.service';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Low Stock Alerts</h2>
    <p *ngIf="items.length === 0">No low-stock items.</p>
    <table *ngIf="items.length > 0">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Qty On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items">
          <td>{{ item.product?.name }}</td>
          <td>{{ item.product?.sku }}</td>
          <td>{{ item.quantityOnHand }}</td>
          <td>{{ item.reorderLevel }}</td>
          <td>{{ item.warehouseLocation }}</td>
          <td>
            <button (click)="restock(item.productId)">Restock +50</button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class LowStockComponent implements OnInit {
  items: InventoryItemDto[] = [];

  constructor(private inventoryService: InventoryApiService) {}

  ngOnInit(): void {
    this.loadLowStock();
  }

  loadLowStock(): void {
    this.inventoryService.getLowStock().subscribe(data => this.items = data);
  }

  restock(productId: number): void {
    this.inventoryService.restock(productId, 50).subscribe(() => this.loadLowStock());
  }
}
