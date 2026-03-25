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
    <h2>Inventory Items</h2>
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product ID</th>
          <th>Product Name</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
          <th>Status</th>
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
            <span class="badge" [class.badge-warning]="i.quantityOnHand <= i.reorderLevel" [class.badge-success]="i.quantityOnHand > i.reorderLevel">
              {{i.quantityOnHand <= i.reorderLevel ? 'Low Stock' : 'In Stock'}}
            </span>
          </td>
          <td>
            <input type="number" [(ngModel)]="restockQuantities[i.productId]" placeholder="Qty" min="1" style="width:60px;margin-right:8px;">
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
  restockQuantities: { [key: number]: number } = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.http.get<any[]>(`${environment.apiUrl}/api/inventory`).subscribe(data => this.items = data);
  }

  restock(productId: number) {
    const quantity = this.restockQuantities[productId] || 1;
    this.http.post(`${environment.apiUrl}/api/inventory/product/${productId}/restock`, { quantity })
      .subscribe(() => this.loadInventory());
  }
}
