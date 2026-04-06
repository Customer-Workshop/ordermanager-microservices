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
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Inventory Items</h2>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items" [class.table-warning]="item.quantityOnHand <= item.reorderLevel">
          <td>{{ item.productName }}</td>
          <td>{{ item.quantityOnHand }}</td>
          <td>{{ item.reorderLevel }}</td>
          <td>{{ item.warehouseLocation }}</td>
          <td>
            <span *ngIf="item.quantityOnHand <= item.reorderLevel" class="badge bg-warning">Low Stock</span>
            <span *ngIf="item.quantityOnHand > item.reorderLevel" class="badge bg-success">In Stock</span>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/api/inventory`)
      .subscribe(data => this.items = data);
  }
}
