import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Inventory Items</h2>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Product</th><th>SKU</th><th>On Hand</th><th>Reorder Level</th><th>Last Restocked</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items" [class.table-danger]="item.quantityOnHand <= item.reorderLevel">
          <td>{{ item.productName }}</td>
          <td>{{ item.sku }}</td>
          <td>{{ item.quantityOnHand }}</td>
          <td>{{ item.reorderLevel }}</td>
          <td>{{ item.lastRestocked | date:'short' }}</td>
          <td>
            <input type="number" [(ngModel)]="item.restockQty" min="1" class="form-control form-control-sm d-inline-block" style="width:80px" placeholder="Qty">
            <button class="btn btn-sm btn-success ms-1" (click)="restock(item)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }
  load() {
    this.http.get<any[]>(`${environment.apiUrl}/api/inventory`).subscribe(data => this.items = data.map(i => ({ ...i, restockQty: 10 })));
  }
  restock(item: any) {
    this.http.post(`${environment.apiUrl}/api/inventory/product/${item.productId}/restock`, { quantity: item.restockQty }).subscribe(() => this.load());
  }
}
