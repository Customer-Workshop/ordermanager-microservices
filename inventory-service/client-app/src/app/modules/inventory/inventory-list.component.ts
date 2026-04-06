import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  quantityOnHand: number;
  reorderLevel: number;
  warehouseLocation: string;
  lastRestocked: string;
}

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h2>Inventory Items</h2>
    <a routerLink="/low-stock">View Low Stock Items</a>
    <table *ngIf="items.length > 0">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Quantity</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items" [class.low-stock]="item.quantityOnHand <= item.reorderLevel">
          <td>{{ item.productName }}</td>
          <td>{{ item.sku }}</td>
          <td>{{ item.quantityOnHand }}</td>
          <td>{{ item.reorderLevel }}</td>
          <td>{{ item.warehouseLocation }}</td>
          <td>{{ item.lastRestocked | date }}</td>
          <td>
            <button (click)="restock(item.productId)">Restock +10</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="items.length === 0">Loading inventory...</p>
  `,
  styles: [`
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
    th { background: #f5f5f5; }
    .low-stock { background: #fff3cd; }
    button { cursor: pointer; padding: 4px 8px; }
    a { display: inline-block; margin-top: 8px; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/api/inventory`)
      .subscribe(data => this.items = data);
  }

  restock(productId: number): void {
    this.http.post<InventoryItem>(`${environment.apiUrl}/api/inventory/product/${productId}/restock`, { quantity: 10 })
      .subscribe(() => this.loadItems());
  }
}
