import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
    <div *ngIf="items.length === 0" class="alert alert-success">All items are adequately stocked.</div>
    <table *ngIf="items.length > 0" class="table table-striped table-warning">
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
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
  `
})
export class LowStockComponent implements OnInit {
  items: InventoryItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/api/inventory/low-stock`)
      .subscribe(data => this.items = data);
  }
}
