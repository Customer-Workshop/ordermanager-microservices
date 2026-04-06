import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryApiService, InventoryItemDto } from './inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Inventory</h2>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Price</th>
          <th>Qty On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items">
          <td>{{ item.product?.name }}</td>
          <td>{{ item.product?.sku }}</td>
          <td>{{ item.product?.price | currency }}</td>
          <td>{{ item.quantityOnHand }}</td>
          <td>{{ item.reorderLevel }}</td>
          <td>{{ item.warehouseLocation }}</td>
          <td>
            <span [class]="item.quantityOnHand <= item.reorderLevel ? 'badge-low' : 'badge-ok'">
              {{ item.quantityOnHand <= item.reorderLevel ? 'Low Stock' : 'In Stock' }}
            </span>
          </td>
          <td>
            <button (click)="restock(item.productId)">Restock +10</button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class InventoryListComponent implements OnInit {
  items: InventoryItemDto[] = [];

  constructor(private inventoryService: InventoryApiService) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.inventoryService.getAll().subscribe(data => this.items = data);
  }

  restock(productId: number): void {
    this.inventoryService.restock(productId, 10).subscribe(() => this.loadInventory());
  }
}
