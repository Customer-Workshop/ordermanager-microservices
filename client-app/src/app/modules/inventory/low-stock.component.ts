import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Low Stock Items</h2>
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items" class="low-stock">
          <td>{{ item.productName }}</td>
          <td>{{ item.sku }}</td>
          <td>{{ item.quantityOnHand }}</td>
          <td>{{ item.reorderLevel }}</td>
          <td>{{ item.warehouseLocation }}</td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">No low stock items.</p>
  `
})
export class LowStockComponent implements OnInit {
  items: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('/api/inventory/low-stock').subscribe(data => this.items = data);
  }
}
