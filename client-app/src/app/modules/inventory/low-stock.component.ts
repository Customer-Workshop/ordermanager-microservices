import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryItem } from './inventory.model';
import { InventoryService } from './inventory.service';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Low Stock Alerts</h2>
    <p *ngIf="!items.length && !loading">All items are adequately stocked.</p>
    <p *ngIf="loading">Loading...</p>

    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Deficit</th>
          <th>Location</th>
          <th>Restock</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items" class="low-stock">
          <td>{{item.productName}}</td>
          <td>{{item.quantityOnHand}}</td>
          <td>{{item.reorderLevel}}</td>
          <td>{{item.reorderLevel - item.quantityOnHand}}</td>
          <td>{{item.warehouseLocation}}</td>
          <td>
            <input type="number" [(ngModel)]="restockQuantities[item.productId]" min="1" [placeholder]="item.reorderLevel - item.quantityOnHand + 10">
            <button (click)="restock(item.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class LowStockComponent implements OnInit {
  items: InventoryItem[] = [];
  restockQuantities: { [productId: number]: number } = {};
  loading = true;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.inventoryService.getLowStock().subscribe({
      next: data => {
        this.items = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  restock(productId: number): void {
    const quantity = this.restockQuantities[productId];
    if (!quantity || quantity < 1) return;

    this.inventoryService.restock(productId, quantity).subscribe({
      next: () => {
        this.restockQuantities[productId] = 0;
        this.loadItems();
      }
    });
  }
}
