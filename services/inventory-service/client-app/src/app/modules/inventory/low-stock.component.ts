import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
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
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Low Stock Alerts</h2>
    <p *ngIf="!items.length && loaded">All items are sufficiently stocked.</p>
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items" class="low-stock">
          <td>{{item.productName}}</td>
          <td>{{item.sku}}</td>
          <td>{{item.quantityOnHand}} <span class="badge badge-danger">LOW</span></td>
          <td>{{item.reorderLevel}}</td>
          <td>{{item.warehouseLocation}}</td>
          <td>{{item.lastRestocked | date}}</td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!loaded">Loading...</p>
  `
})
export class LowStockComponent implements OnInit {
  items: InventoryItem[] = [];
  loaded = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/api/inventory/low-stock`).subscribe(data => {
      this.items = data;
      this.loaded = true;
    });
  }
}
