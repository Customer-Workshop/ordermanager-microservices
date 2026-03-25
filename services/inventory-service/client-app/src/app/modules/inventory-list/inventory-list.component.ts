import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Inventory</h2>
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product ID</th>
          <th>Product</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let i of items" [class.low-stock]="i.quantityOnHand <= i.reorderLevel">
          <td>{{i.productId}}</td>
          <td>{{i.productName}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
          <td>{{i.lastRestocked | date}}</td>
          <td>
            <span *ngIf="i.quantityOnHand <= i.reorderLevel" class="badge-warning">Low Stock</span>
            <span *ngIf="i.quantityOnHand > i.reorderLevel" class="badge-ok">In Stock</span>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length && !loading">No inventory items found.</p>
    <p *ngIf="loading">Loading...</p>
  `,
  styles: [`
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f5f5f5; font-weight: 600; }
    .low-stock { background-color: #fff3cd; }
    .badge-warning { color: #856404; background: #fff3cd; padding: 2px 8px; border-radius: 4px; font-size: 0.85em; }
    .badge-ok { color: #155724; background: #d4edda; padding: 2px 8px; border-radius: 4px; font-size: 0.85em; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/api/inventory`).subscribe({
      next: data => { this.items = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}

interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  quantityOnHand: number;
  reorderLevel: number;
  warehouseLocation: string;
  lastRestocked: string;
}
