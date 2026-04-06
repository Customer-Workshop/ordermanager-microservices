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
    <div class="low-stock-container">
      <h2>Low Stock Alerts</h2>
      <a routerLink="/">Back to Inventory</a>
      <div *ngIf="items.length === 0" class="no-alerts">No low stock alerts.</div>
      <div *ngFor="let item of items" class="alert-card">
        <strong>{{ item.productName }}</strong> ({{ item.sku }})
        <span class="qty">Qty: {{ item.quantityOnHand }} / Reorder at: {{ item.reorderLevel }}</span>
        <span class="location">Location: {{ item.warehouseLocation }}</span>
      </div>
    </div>
  `,
  styles: [`
    .low-stock-container { padding: 1rem; }
    .alert-card { border: 1px solid #e74c3c; border-radius: 4px; padding: 12px; margin: 8px 0; background: #fff5f5; }
    .qty, .location { display: block; font-size: 0.9em; color: #555; }
    .no-alerts { padding: 1rem; color: #27ae60; }
  `]
})
export class LowStockComponent implements OnInit {
  items: InventoryItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/api/inventory/low-stock`)
      .subscribe(data => this.items = data);
  }
}
