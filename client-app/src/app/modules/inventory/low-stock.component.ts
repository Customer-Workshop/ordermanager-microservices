import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  quantityOnHand: number;
  reorderLevel: number;
  warehouseLocation: string;
}

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Low Stock Items</h2>
    <div *ngIf="items.length === 0">No low stock items.</div>
    <table *ngIf="items.length > 0">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items">
          <td>{{ item.productName }}</td>
          <td>{{ item.quantityOnHand }}</td>
          <td>{{ item.reorderLevel }}</td>
          <td>{{ item.warehouseLocation }}</td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #e74c3c; color: white; }
  `]
})
export class LowStockComponent implements OnInit {
  items: InventoryItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<InventoryItem[]>('/api/inventory/low-stock').subscribe(data => this.items = data);
  }
}
