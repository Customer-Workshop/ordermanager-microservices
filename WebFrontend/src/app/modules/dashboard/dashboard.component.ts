import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your order management system</p>
      </div>
      <div class="stats-row">
        <div class="stat-card"><div class="stat-icon purple">&#128230;</div><div class="stat-label">Total Orders</div><div class="stat-value">{{ stats.orders }}</div></div>
        <div class="stat-card"><div class="stat-icon green">&#128722;</div><div class="stat-label">Products</div><div class="stat-value">{{ stats.products }}</div></div>
        <div class="stat-card"><div class="stat-icon yellow">&#128101;</div><div class="stat-label">Customers</div><div class="stat-value">{{ stats.customers }}</div></div>
        <div class="stat-card"><div class="stat-icon red">&#9888;&#65039;</div><div class="stat-label">Low Stock Items</div><div class="stat-value">{{ stats.lowStock }}</div></div>
      </div>
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header"><h3>Recent Orders</h3><a routerLink="/orders" class="btn btn-outline">View All</a></div>
          <div *ngIf="recentOrders.length > 0">
            <table>
              <thead><tr><th>Order ID</th><th>Customer</th><th>Status</th><th class="text-right">Total</th></tr></thead>
              <tbody>
                <tr *ngFor="let o of recentOrders">
                  <td class="font-mono">#{{ o.id }}</td>
                  <td class="font-medium">{{ o.customerName || customerMap[o.customerId] || ('Customer #' + o.customerId) }}</td>
                  <td><span class="badge" [ngClass]="getStatusClass(o.status)">{{ o.status }}</span></td>
                  <td class="text-right font-medium">{{ o.totalAmount | currency }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="recentOrders.length === 0" class="empty-state">
            <div class="empty-icon">&#128203;</div><h3>No orders yet</h3><p>Orders placed through the system will appear here.</p>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>Inventory Status</h3><a routerLink="/inventory" class="btn btn-outline">View All</a></div>
          <div *ngIf="inventoryItems.length > 0">
            <table>
              <thead><tr><th>Product</th><th>Stock</th><th>Status</th></tr></thead>
              <tbody>
                <tr *ngFor="let item of inventoryItems">
                  <td class="font-medium">{{ item.productName || item.product?.name }}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <div class="progress-bar" style="width:80px"><div class="fill" [style.width.%]="getStockPercent(item)" [style.background]="getStockColor(item)"></div></div>
                      <span class="font-mono">{{ item.quantityOnHand }}</span>
                    </div>
                  </td>
                  <td><span class="badge" [ngClass]="getInventoryStatusClass(item)">{{ getInventoryStatus(item) }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  stats = { orders: 0, products: 0, customers: 0, lowStock: 0 };
  recentOrders: any[] = [];
  inventoryItems: any[] = [];
  customerMap: Record<number, string> = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('/api/orders').subscribe(data => { this.stats.orders = data.length; this.recentOrders = data.slice(0, 5); });
    this.http.get<any[]>('/api/products').subscribe(data => this.stats.products = data.length);
    this.http.get<any[]>('/api/customers').subscribe(data => { this.stats.customers = data.length; data.forEach(c => this.customerMap[c.id] = c.name); });
    this.http.get<any[]>('/api/inventory').subscribe(data => { this.inventoryItems = data; this.stats.lowStock = data.filter((i: any) => i.quantityOnHand <= i.reorderLevel).length; });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) { case 'completed': return 'badge-success'; case 'pending': return 'badge-warning'; case 'cancelled': return 'badge-danger'; default: return 'badge-info'; }
  }
  getStockPercent(item: any): number { return Math.min((item.quantityOnHand / 300) * 100, 100); }
  getStockColor(item: any): string {
    if (item.quantityOnHand <= item.reorderLevel) return 'var(--danger)';
    if (item.quantityOnHand <= item.reorderLevel * 3) return 'var(--warning)';
    return 'var(--success)';
  }
  getInventoryStatus(item: any): string {
    if (item.quantityOnHand <= item.reorderLevel) return 'Low Stock';
    if (item.quantityOnHand <= item.reorderLevel * 3) return 'Moderate';
    return 'In Stock';
  }
  getInventoryStatusClass(item: any): string {
    if (item.quantityOnHand <= item.reorderLevel) return 'badge-danger';
    if (item.quantityOnHand <= item.reorderLevel * 3) return 'badge-warning';
    return 'badge-success';
  }
}
