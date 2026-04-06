import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Inventory Management</h2>
    <div class="actions">
      <button (click)="loadInventory()">Refresh</button>
      <button (click)="showLowStock = !showLowStock">
        {{ showLowStock ? 'Show All' : 'Show Low Stock' }}
      </button>
    </div>
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let i of filteredItems" [class.low-stock]="i.quantityOnHand <= i.reorderLevel">
          <td>{{ i.productName }}</td>
          <td>{{ i.sku }}</td>
          <td>{{ i.quantityOnHand }}</td>
          <td>{{ i.reorderLevel }}</td>
          <td>{{ i.warehouseLocation }}</td>
          <td>{{ i.lastRestocked | date }}</td>
          <td>
            <input type="number" [(ngModel)]="restockQuantity" min="1" placeholder="Qty" style="width:60px" />
            <button (click)="restock(i.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">No inventory items found.</p>
  `,
  styles: [`
    .low-stock { background-color: #ffe0e0; }
    .actions { margin-bottom: 1rem; }
    .actions button { margin-right: 0.5rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f5f5f5; font-weight: bold; }
    input { margin-right: 4px; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  showLowStock = false;
  restockQuantity = 10;

  constructor(private http: HttpClient) {}

  get filteredItems() {
    return this.showLowStock
      ? this.items.filter(i => i.quantityOnHand <= i.reorderLevel)
      : this.items;
  }

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.http.get<any[]>(`${environment.apiUrl}/api/inventory`).subscribe(data => this.items = data);
  }

  restock(productId: number) {
    this.http.post(`${environment.apiUrl}/api/inventory/product/${productId}/restock`, { quantity: this.restockQuantity })
      .subscribe(() => this.loadInventory());
  }
}
