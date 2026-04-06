import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
  imports: [CommonModule],
  template: `
    <div class="inventory-container">
      <h2>Inventory Items</h2>
      <a routerLink="/low-stock">View Low Stock Alerts</a>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Qty On Hand</th>
            <th>Reorder Level</th>
            <th>Warehouse</th>
            <th>Last Restocked</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items" [class.low-stock]="item.quantityOnHand <= item.reorderLevel">
            <td>{{ item.productName }}</td>
            <td>{{ item.sku }}</td>
            <td>{{ item.quantityOnHand }}</td>
            <td>{{ item.reorderLevel }}</td>
            <td>{{ item.warehouseLocation }}</td>
            <td>{{ item.lastRestocked | date:'short' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .inventory-container { padding: 1rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
    .low-stock { background-color: #ffe0e0; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/api/inventory`)
      .subscribe(data => this.items = data);
  }
}
