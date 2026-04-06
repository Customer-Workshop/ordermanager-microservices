import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

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
  imports: [CommonModule],
  template: `
    <h2>Inventory</h2>
    <div class="controls">
      <button (click)="toggleLowStockFilter()">
        {{ showLowStockOnly ? 'Show All' : 'Show Low Stock Only' }}
      </button>
    </div>
    <table *ngIf="filteredItems.length">
      <thead>
        <tr>
          <th>Product</th>
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
          <td>{{ i.quantityOnHand }}</td>
          <td>{{ i.reorderLevel }}</td>
          <td>{{ i.warehouseLocation }}</td>
          <td>{{ i.lastRestocked | date }}</td>
          <td>
            <button (click)="restock(i.productId)">Restock (+10)</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!filteredItems.length">No inventory items found.</p>
  `,
  styles: [`
    .low-stock { background-color: #ffe0e0; }
    .controls { margin-bottom: 1rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
    button { cursor: pointer; padding: 4px 12px; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  showLowStockOnly = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.http.get<InventoryItem[]>(environment.apiUrl).subscribe(data => {
      this.items = data;
      this.applyFilter();
    });
  }

  toggleLowStockFilter() {
    this.showLowStockOnly = !this.showLowStockOnly;
    this.applyFilter();
  }

  applyFilter() {
    this.filteredItems = this.showLowStockOnly
      ? this.items.filter(i => i.quantityOnHand <= i.reorderLevel)
      : this.items;
  }

  restock(productId: number) {
    this.http.post<InventoryItem>(`${environment.apiUrl}/product/${productId}/restock`, { quantity: 10 })
      .subscribe(() => this.loadInventory());
  }
}
