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
}

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 1rem;">
      <h3 style="color: #e65100;">Low Stock Alerts</h3>
      <div *ngIf="items.length === 0" style="padding: 1rem; color: #2e7d32;">
        All items are sufficiently stocked.
      </div>
      <div *ngFor="let item of items" style="padding: 1rem; margin: 0.5rem 0; border: 1px solid #ffcc80; border-radius: 4px; background: #fff3e0;">
        <strong>{{ item.productName }}</strong> ({{ item.sku }})
        <br>
        Quantity: {{ item.quantityOnHand }} / Reorder Level: {{ item.reorderLevel }}
        <br>
        Location: {{ item.warehouseLocation }}
      </div>
    </div>
  `
})
export class LowStockComponent implements OnInit {
  items: InventoryItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/api/inventory/low-stock`)
      .subscribe(items => this.items = items);
  }
}
