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
    <table *ngIf="items.length">
      <thead>
        <tr><th>Product</th><th>Qty</th><th>Reorder Level</th><th>Location</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items" [class.low-stock]="item.quantityOnHand <= item.reorderLevel">
          <td>{{item.productName}}</td>
          <td>{{item.quantityOnHand}}</td>
          <td>{{item.reorderLevel}}</td>
          <td>{{item.warehouseLocation}}</td>
          <td>
            <input type="number" [(ngModel)]="restockQty" min="1" placeholder="Qty" style="width:60px">
            <button (click)="restock(item.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  restockQty = 10;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadItems(); }

  loadItems() {
    this.http.get<any[]>(`${environment.apiUrl}/api/inventory`).subscribe(data => this.items = data);
  }

  restock(productId: number) {
    this.http.post(`${environment.apiUrl}/api/inventory/product/${productId}/restock`, { quantity: this.restockQty })
      .subscribe(() => this.loadItems());
  }
}
