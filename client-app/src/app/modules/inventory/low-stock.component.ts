import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Low Stock Alerts</h2>
    <div class="alert" *ngIf="items.length">
      <strong>{{items.length}} item(s)</strong> are at or below reorder level.
    </div>
    <p *ngIf="!items.length && loaded">All inventory levels are healthy.</p>
    <table *ngIf="items.length">
      <thead>
        <tr><th>Product</th><th>Product ID</th><th>On Hand</th><th>Reorder Level</th><th>Location</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let i of items" class="low-stock">
          <td>{{i.productName}}</td>
          <td>{{i.productId}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
        </tr>
      </tbody>
    </table>
  `
})
export class LowStockComponent implements OnInit {
  items: any[] = [];
  loaded = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/api/inventory/low-stock`).subscribe(data => {
      this.items = data;
      this.loaded = true;
    });
  }
}
