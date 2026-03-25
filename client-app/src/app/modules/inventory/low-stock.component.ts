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
      <thead><tr><th>Product</th><th>Product ID</th><th>On Hand</th><th>Reorder Level</th><th>Location</th></tr></thead>
      <tbody>
        <tr *ngFor="let i of items">
          <td>{{i.productName}}</td>
          <td>{{i.productId}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">No low-stock items.</p>
  `
})
export class LowStockComponent implements OnInit {
  items: any[] = [];
  constructor(private http: HttpClient) {}
  ngOnInit() { this.http.get<any[]>('/api/inventory/low-stock').subscribe(data => this.items = data); }
}
