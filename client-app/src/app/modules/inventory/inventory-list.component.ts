import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  quantityOnHand: number;
  reorderLevel: number;
  warehouseLocation: string;
  lastRestocked: string;
}

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Inventory Items</h2>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items" [class.low-stock]="item.quantityOnHand <= item.reorderLevel">
          <td>{{ item.productName }}</td>
          <td>{{ item.quantityOnHand }}</td>
          <td>{{ item.reorderLevel }}</td>
          <td>{{ item.warehouseLocation }}</td>
          <td>{{ item.lastRestocked | date:'short' }}</td>
          <td>
            <input type="number" [(ngModel)]="restockQty" min="1" placeholder="Qty" style="width:60px">
            <button (click)="restock(item.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    .low-stock { background-color: #ffcccc; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  restockQty = 10;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.http.get<InventoryItem[]>('/api/inventory').subscribe(data => this.items = data);
  }

  restock(productId: number): void {
    this.http.post(`/api/inventory/product/${productId}/restock`, { quantity: this.restockQty })
      .subscribe(() => this.loadItems());
  }
}
