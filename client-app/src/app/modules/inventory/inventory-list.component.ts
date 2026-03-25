import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  quantityOnHand: number;
  reorderLevel: number;
  warehouseLocation: string;
  lastRestocked: string;
}

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Inventory Items</h2>
    <table class="table table-striped" *ngIf="items.length">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items" [class.table-warning]="item.quantityOnHand <= item.reorderLevel">
          <td>{{ item.productName }}</td>
          <td>{{ item.quantityOnHand }}</td>
          <td>{{ item.reorderLevel }}</td>
          <td>{{ item.warehouseLocation }}</td>
          <td>{{ item.lastRestocked | date:'short' }}</td>
          <td>
            <input type="number" [(ngModel)]="restockQty" min="1" class="form-control form-control-sm d-inline-block" style="width:80px" />
            <button class="btn btn-sm btn-success ms-1" (click)="restock(item.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">Loading...</p>
  `
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  restockQty = 10;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/api/inventory`).subscribe(data => this.items = data);
  }

  restock(productId: number): void {
    this.http.post(`${environment.apiUrl}/api/inventory/product/${productId}/restock`, { quantity: this.restockQty })
      .subscribe(() => this.loadItems());
  }
}
