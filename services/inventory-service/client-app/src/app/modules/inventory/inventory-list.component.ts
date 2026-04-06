import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
  imports: [CommonModule],
  template: `
    <div style="padding: 1rem;">
      <h3>Inventory Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">SKU</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Qty On Hand</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Reorder Level</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Location</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items" [style.background]="item.quantityOnHand <= item.reorderLevel ? '#fff3e0' : 'transparent'">
            <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ item.productName }}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ item.sku }}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">{{ item.quantityOnHand }}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">{{ item.reorderLevel }}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">{{ item.warehouseLocation }}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              <span *ngIf="item.quantityOnHand <= item.reorderLevel" style="color: #e65100; font-weight: bold;">LOW STOCK</span>
              <span *ngIf="item.quantityOnHand > item.reorderLevel" style="color: #2e7d32;">In Stock</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/api/inventory`)
      .subscribe(items => this.items = items);
  }
}
