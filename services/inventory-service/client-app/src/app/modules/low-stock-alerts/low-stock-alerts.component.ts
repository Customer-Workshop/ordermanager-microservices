import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-low-stock-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Low Stock Alerts</h2>
    <div *ngIf="items.length" class="alert-list">
      <div *ngFor="let i of items" class="alert-card">
        <strong>{{i.productName}}</strong> (Product #{{i.productId}})
        <br/>
        <span class="qty">{{i.quantityOnHand}} remaining</span> &mdash;
        Reorder level: {{i.reorderLevel}} &mdash;
        Location: {{i.warehouseLocation}}
      </div>
    </div>
    <p *ngIf="!items.length && !loading" class="no-alerts">All stock levels are healthy.</p>
    <p *ngIf="loading">Checking stock levels...</p>
  `,
  styles: [`
    .alert-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
    .alert-card { padding: 1rem; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; }
    .qty { color: #856404; font-weight: 600; }
    .no-alerts { color: #155724; margin-top: 1rem; }
  `]
})
export class LowStockAlertsComponent implements OnInit {
  items: LowStockItem[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<LowStockItem[]>(`${environment.apiUrl}/api/inventory/low-stock`).subscribe({
      next: data => { this.items = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}

interface LowStockItem {
  id: number;
  productId: number;
  productName: string;
  quantityOnHand: number;
  reorderLevel: number;
  warehouseLocation: string;
}
