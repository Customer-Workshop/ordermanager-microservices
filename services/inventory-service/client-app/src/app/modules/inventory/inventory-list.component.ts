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
      <button (click)="loadLowStock()">Show Low Stock</button>
      <button (click)="showAll = true; loadInventory()">Show All</button>
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
        <tr *ngFor="let i of items" [class.low-stock]="i.quantityOnHand <= i.reorderLevel">
          <td>{{i.productName}}</td>
          <td>{{i.sku}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
          <td>{{i.lastRestocked | date}}</td>
          <td>
            <input type="number" [(ngModel)]="restockQuantities[i.productId]" placeholder="Qty" min="1" style="width: 60px" />
            <button (click)="restock(i.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p *ngIf="!items.length">No inventory items found.</p>
  `,
  styles: [`
    .low-stock { background-color: #ffe0e0; }
    .actions { margin-bottom: 16px; }
    .actions button { margin-right: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f5f5f5; font-weight: bold; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  showAll = true;
  restockQuantities: { [productId: number]: number } = {};

  private apiUrl = environment.apiUrl || '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.showAll = true;
    this.http.get<any[]>(`${this.apiUrl}/api/inventory`).subscribe(data => this.items = data);
  }

  loadLowStock() {
    this.showAll = false;
    this.http.get<any[]>(`${this.apiUrl}/api/inventory/low-stock`).subscribe(data => this.items = data);
  }

  restock(productId: number) {
    const qty = this.restockQuantities[productId] || 0;
    if (qty <= 0) return;
    this.http.post(`${this.apiUrl}/api/inventory/product/${productId}/restock`, { quantity: qty })
      .subscribe(() => {
        this.restockQuantities[productId] = 0;
        this.loadInventory();
      });
  }
}
