import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Low Stock Alerts</h2>
    <div *ngIf="items.length === 0" class="alert alert-success">All items are well-stocked.</div>
    <table *ngIf="items.length > 0" class="table table-striped table-danger">
      <thead><tr><th>Product</th><th>SKU</th><th>On Hand</th><th>Reorder Level</th></tr></thead>
      <tbody>
        <tr *ngFor="let item of items">
          <td>{{ item.productName }}</td><td>{{ item.sku }}</td><td>{{ item.quantityOnHand }}</td><td>{{ item.reorderLevel }}</td>
        </tr>
      </tbody>
    </table>
  `
})
export class LowStockComponent implements OnInit {
  items: any[] = [];
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/api/inventory/low-stock`).subscribe(data => this.items = data);
  }
}
