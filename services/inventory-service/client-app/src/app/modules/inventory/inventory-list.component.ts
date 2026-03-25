import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
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
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items" [class.low-stock]="item.quantityOnHand <= item.reorderLevel">
          <td>{{item.productName}}</td>
          <td>{{item.sku}}</td>
          <td>
            {{item.quantityOnHand}}
            <span *ngIf="item.quantityOnHand <= item.reorderLevel" class="badge badge-danger">LOW</span>
            <span *ngIf="item.quantityOnHand > item.reorderLevel" class="badge badge-success">OK</span>
          </td>
          <td>{{item.reorderLevel}}</td>
          <td>{{item.warehouseLocation}}</td>
          <td>{{item.lastRestocked | date}}</td>
          <td>
            <input type="number" [(ngModel)]="restockQuantities[item.productId]" min="1" placeholder="Qty" style="width:60px;margin-right:4px">
            <button class="btn btn-primary" (click)="restock(item.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">Loading inventory...</p>
  `
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  restockQuantities: { [productId: number]: number } = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/api/inventory`).subscribe(data => this.items = data);
  }

  restock(productId: number) {
    const quantity = this.restockQuantities[productId] || 0;
    if (quantity <= 0) return;
    this.http.post(`${environment.apiUrl}/api/inventory/product/${productId}/restock`, { quantity })
      .subscribe(() => {
        this.restockQuantities[productId] = 0;
        this.loadInventory();
      });
  }
}
