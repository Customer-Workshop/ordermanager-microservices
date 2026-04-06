import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface InventoryItem {
  id: number;
  productId: number;
  product: { id: number; name: string; sku: string; price: number };
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
    <div class="container mt-4">
      <h2>Inventory Management</h2>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Qty On Hand</th>
            <th>Reorder Level</th>
            <th>Location</th>
            <th>Last Restocked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items"
              [style.background-color]="item.quantityOnHand <= item.reorderLevel ? '#ffcccc' : ''">
            <td>{{ item.product.name }}</td>
            <td>{{ item.product.sku }}</td>
            <td>{{ item.quantityOnHand }}</td>
            <td>{{ item.reorderLevel }}</td>
            <td>{{ item.warehouseLocation }}</td>
            <td>{{ item.lastRestocked | date:'short' }}</td>
            <td>
              <input type="number" [(ngModel)]="restockQuantities[item.productId]"
                     placeholder="Qty" style="width:60px" min="1">
              <button class="btn btn-sm btn-primary ms-1"
                      (click)="restock(item.productId)">Restock</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  restockQuantities: { [key: number]: number } = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/inventory`)
      .subscribe(data => this.items = data);
  }

  restock(productId: number): void {
    const qty = this.restockQuantities[productId];
    if (!qty || qty <= 0) return;
    this.http.post(`${environment.apiUrl}/inventory/product/${productId}/restock`, { quantity: qty })
      .subscribe(() => {
        this.restockQuantities[productId] = 0;
        this.loadInventory();
      });
  }
}
