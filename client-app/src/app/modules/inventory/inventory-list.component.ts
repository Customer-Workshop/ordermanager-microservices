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
    <h2>Inventory</h2>
    <div class="actions">
      <button (click)="loadAll()">All Items</button>
      <button (click)="loadLowStock()">Low Stock</button>
    </div>
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product ID</th>
          <th>Product</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
          <th>Actions</th>
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
            <input type="number" [(ngModel)]="restockQty" min="1" placeholder="Qty" style="width:60px">
            <button (click)="restock(i.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">Loading inventory...</p>
  `
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  restockQty = 10;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.http.get<any[]>(`${this.apiUrl}/api/inventory`).subscribe(data => this.items = data);
  }

  loadLowStock() {
    this.http.get<any[]>(`${this.apiUrl}/api/inventory/low-stock`).subscribe(data => this.items = data);
  }
  restock(productId: number) {
    this.http.post(`${this.apiUrl}/api/inventory/product/${productId}/restock`, { quantity: this.restockQty })
      .subscribe(() => this.loadAll());
  }
}
