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
    <div class="controls">
      <button (click)="loadInventory()">Refresh</button>
      <button (click)="showLowStock = !showLowStock; showLowStock ? loadLowStock() : loadInventory()">
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
        <tr *ngFor="let i of items" [class.low-stock]="i.quantityOnHand <= i.reorderLevel">
          <td>{{ i.productName }}</td>
          <td>{{ i.sku }}</td>
          <td>{{ i.quantityOnHand }}</td>
          <td>{{ i.reorderLevel }}</td>
          <td>{{ i.warehouseLocation }}</td>
          <td>{{ i.lastRestocked | date }}</td>
          <td>
            <input type="number" [(ngModel)]="restockQuantities[i.productId]" min="1" placeholder="Qty" style="width:60px" />
            <button (click)="restock(i.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">No inventory items found.</p>
    <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
  `,
  styles: [`
    .low-stock { background-color: #fff3cd; }
    .error { color: red; margin-top: 8px; }
    .controls { margin-bottom: 12px; }
    .controls button { margin-right: 8px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  showLowStock = false;
  restockQuantities: { [productId: number]: number } = {};
  errorMessage = '';

  private apiUrl = environment.apiUrl || '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.errorMessage = '';
    this.http.get<any[]>(`${this.apiUrl}/api/inventory`).subscribe({
      next: data => this.items = data,
      error: () => this.errorMessage = 'Failed to load inventory.'
    });
  }

  loadLowStock() {
    this.errorMessage = '';
    this.http.get<any[]>(`${this.apiUrl}/api/inventory/low-stock`).subscribe({
      next: data => this.items = data,
      error: () => this.errorMessage = 'Failed to load low stock items.'
    });
  }

  restock(productId: number) {
    const qty = this.restockQuantities[productId];
    if (!qty || qty < 1) {
      this.errorMessage = 'Please enter a valid quantity.';
      return;
    }
    this.errorMessage = '';
    this.http.post(`${this.apiUrl}/api/inventory/product/${productId}/restock`, { quantity: qty }).subscribe({
      next: () => {
        this.restockQuantities[productId] = 0;
        this.showLowStock ? this.loadLowStock() : this.loadInventory();
      },
      error: () => this.errorMessage = 'Failed to restock item.'
    });
  }
}
