import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h2>Inventory</h2><p>Monitor stock levels and warehouse locations</p></div>
      <div class="stats-row">
        <div class="stat-card"><div class="stat-icon purple"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg></div><div class="stat-label">Tracked Items</div><div class="stat-value">{{ items.length }}</div></div>
        <div class="stat-card"><div class="stat-icon green"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div><div class="stat-label">Total Units</div><div class="stat-value">{{ getTotalUnits() }}</div></div>
        <div class="stat-card"><div class="stat-icon yellow"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div class="stat-label">Low Stock</div><div class="stat-value">{{ getLowStockCount() }}</div></div>
        <div class="stat-card"><div class="stat-icon red"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div><div class="stat-label">Warehouses</div><div class="stat-value">{{ getLocations().length }}</div></div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>Stock Levels</h3>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="btn" [class.btn-primary]="showFilter==='all'" [class.btn-outline]="showFilter!=='all'" (click)="showFilter='all'">All</button>
            <button class="btn" [class.btn-primary]="showFilter==='low'" [class.btn-outline]="showFilter!=='low'" (click)="showFilter='low'">Low Stock</button>
            <button class="btn" [class.btn-primary]="showFilter==='ok'" [class.btn-outline]="showFilter!=='ok'" (click)="showFilter='ok'">In Stock</button>
          </div>
        </div>
        <table *ngIf="getFilteredItems().length">
          <thead><tr><th>Product</th><th>Location</th><th class="text-right">On Hand</th><th class="text-right">Reorder Level</th><th>Stock Level</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let item of getFilteredItems()">
              <td class="font-medium">{{ item.productName || item.product?.name }}</td>
              <td><span class="badge badge-gray font-mono">{{ item.warehouseLocation }}</span></td>
              <td class="text-right font-mono font-medium">{{ item.quantityOnHand }}</td>
              <td class="text-right font-mono text-gray">{{ item.reorderLevel }}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div class="progress-bar" style="width:100px"><div class="fill" [style.width.%]="getStockPercent(item)" [style.background]="getStockColor(item)"></div></div>
                  <span class="text-gray" style="font-size:12px">{{ getStockPercent(item) | number:'1.0-0' }}%</span>
                </div>
              </td>
              <td><span class="badge" [ngClass]="getStatusClass(item)">{{ getStatusLabel(item) }}</span></td>
              <td>
                <button class="btn btn-success btn-sm" (click)="openRestock(item)">Restock</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!getFilteredItems().length" class="empty-state">
          <div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg></div><h3>No items match the filter</h3><p>Try selecting a different filter option.</p>
        </div>
      </div>
    </div>

    <!-- Restock Modal -->
    <div class="modal-backdrop" *ngIf="restockItem" (click)="restockItem = null">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>Restock: {{ restockItem.productName || restockItem.product?.name }}</h3><button class="modal-close" (click)="restockItem = null">&times;</button></div>
        <div class="modal-body">
          <p style="margin-bottom:16px;color:var(--gray-600)">Current stock: <strong>{{ restockItem.quantityOnHand }}</strong> units (Reorder level: {{ restockItem.reorderLevel }})</p>
          <div class="form-group"><label>Quantity to Add</label><input class="form-control" type="number" min="1" [(ngModel)]="restockQuantity" placeholder="Enter quantity"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="restockItem = null">Cancel</button>
          <button class="btn btn-success" (click)="restock()" [disabled]="saving">{{ saving ? 'Restocking...' : 'Restock' }}</button>
        </div>
      </div>
    </div>

    <div class="toast toast-success" *ngIf="toast">{{ toast }}</div>
    <div class="toast toast-error" *ngIf="error">{{ error }}</div>
  `
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  showFilter: 'all' | 'low' | 'ok' = 'all';
  restockItem: any = null;
  restockQuantity = 50;
  saving = false;
  toast = '';
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadInventory(); }

  loadInventory() { this.http.get<any[]>('/api/inventory').subscribe(data => this.items = data); }

  getFilteredItems(): any[] {
    if (this.showFilter === 'low') return this.items.filter(i => i.quantityOnHand <= i.reorderLevel);
    if (this.showFilter === 'ok') return this.items.filter(i => i.quantityOnHand > i.reorderLevel);
    return this.items;
  }

  openRestock(item: any) { this.restockItem = item; this.restockQuantity = 50; }

  restock() {
    if (this.restockQuantity < 1) { this.showError('Quantity must be at least 1'); return; }
    this.saving = true;
    const productId = this.restockItem.productId || this.restockItem.product?.id;
    this.http.post(`/api/inventory/product/${productId}/restock`, { quantity: this.restockQuantity }).subscribe({
      next: () => { this.restockItem = null; this.saving = false; this.loadInventory(); this.showToast(`Restocked ${this.restockQuantity} units successfully`); },
      error: (err) => { this.saving = false; this.showError(err.error?.error || 'Failed to restock'); }
    });
  }

  getTotalUnits(): number { return this.items.reduce((s, i) => s + i.quantityOnHand, 0); }
  getLowStockCount(): number { return this.items.filter(i => i.quantityOnHand <= i.reorderLevel).length; }
  getLocations(): string[] { return [...new Set(this.items.map(i => i.warehouseLocation).filter(Boolean))] as string[]; }
  getStockPercent(item: any): number { return Math.min((item.quantityOnHand / 300) * 100, 100); }
  getStockColor(item: any): string {
    if (item.quantityOnHand <= item.reorderLevel) return 'var(--danger)';
    if (item.quantityOnHand <= item.reorderLevel * 3) return 'var(--warning)';
    return 'var(--success)';
  }
  getStatusLabel(item: any): string {
    if (item.quantityOnHand <= item.reorderLevel) return 'Low Stock';
    if (item.quantityOnHand <= item.reorderLevel * 3) return 'Moderate';
    return 'In Stock';
  }
  getStatusClass(item: any): string {
    if (item.quantityOnHand <= item.reorderLevel) return 'badge-danger';
    if (item.quantityOnHand <= item.reorderLevel * 3) return 'badge-warning';
    return 'badge-success';
  }

  showToast(msg: string) { this.toast = msg; setTimeout(() => this.toast = '', 3000); }
  showError(msg: string) { this.error = msg; setTimeout(() => this.error = '', 4000); }
}
