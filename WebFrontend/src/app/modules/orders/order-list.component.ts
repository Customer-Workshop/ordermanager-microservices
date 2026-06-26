import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h2>Orders</h2><p>Track and manage customer orders</p></div>
      <div class="stats-row">
        <div class="stat-card"><div class="stat-icon purple">&#128203;</div><div class="stat-label">Total Orders</div><div class="stat-value">{{ orders.length }}</div></div>
        <div class="stat-card"><div class="stat-icon green">&#9989;</div><div class="stat-label">Completed</div><div class="stat-value">{{ getByStatus('completed') }}</div></div>
        <div class="stat-card"><div class="stat-icon yellow">&#9200;</div><div class="stat-label">Pending</div><div class="stat-value">{{ getByStatus('pending') }}</div></div>
        <div class="stat-card"><div class="stat-icon red">&#128176;</div><div class="stat-label">Total Revenue</div><div class="stat-value">{{ getTotalRevenue() | currency }}</div></div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>All Orders</h3>
          <div style="display:flex;gap:8px;align-items:center">
            <input class="search-input" placeholder="Search orders..." (input)="filterOrders($event)">
            <button class="btn btn-primary" (click)="openCreateOrder()">+ New Order</button>
          </div>
        </div>
        <table *ngIf="filteredOrders.length">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Status</th><th class="text-right">Total</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let o of filteredOrders">
              <td class="font-mono font-medium">#{{ o.id }}</td>
              <td class="font-medium">{{ o.customerName || customerMap[o.customerId] || ('Customer #' + o.customerId) }}</td>
              <td class="text-gray">{{ o.orderDate | date:'mediumDate' }}</td>
              <td><span class="badge" [ngClass]="getStatusClass(o.status)">{{ o.status }}</span></td>
              <td class="text-right font-medium">{{ o.totalAmount | currency }}</td>
              <td>
                <select class="form-control btn-sm" style="width:auto;display:inline;padding:4px 8px;font-size:12px" [ngModel]="o.status" (ngModelChange)="updateStatus(o.id, $event)">
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!filteredOrders.length" class="empty-state">
          <div class="empty-icon">&#128203;</div><h3>No orders yet</h3><p>Create your first order to get started.</p>
        </div>
      </div>
    </div>

    <!-- Create Order Modal -->
    <div class="modal-backdrop" *ngIf="showCreate" (click)="showCreate = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>New Order</h3><button class="modal-close" (click)="showCreate = false">&times;</button></div>
        <div class="modal-body">
          <div class="form-group">
            <label>Customer</label>
            <select class="form-control" [(ngModel)]="newOrder.customerId">
              <option [ngValue]="0" disabled>Select a customer...</option>
              <option *ngFor="let c of availableCustomers" [ngValue]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div style="margin-bottom:12px;font-weight:600;font-size:13px;color:var(--gray-700)">Order Items</div>
          <div *ngFor="let item of newOrder.items; let i = index" style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
            <select class="form-control" [(ngModel)]="item.productId" style="flex:2">
              <option [ngValue]="0" disabled>Select product...</option>
              <option *ngFor="let p of availableProducts" [ngValue]="p.id">{{ p.name }} ({{ p.price | currency }})</option>
            </select>
            <input class="form-control" type="number" min="1" [(ngModel)]="item.quantity" placeholder="Qty" style="flex:0.5">
            <button class="btn btn-outline btn-sm" (click)="removeItem(i)" *ngIf="newOrder.items.length > 1">&times;</button>
          </div>
          <button class="btn btn-outline btn-sm" (click)="addItem()" style="margin-top:8px">+ Add Item</button>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="showCreate = false">Cancel</button>
          <button class="btn btn-primary" (click)="createOrder()" [disabled]="saving">{{ saving ? 'Creating...' : 'Create Order' }}</button>
        </div>
      </div>
    </div>

    <div class="toast toast-success" *ngIf="toast">{{ toast }}</div>
    <div class="toast toast-error" *ngIf="error">{{ error }}</div>
  `
})
export class OrderListComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  availableCustomers: any[] = [];
  availableProducts: any[] = [];
  showCreate = false;
  saving = false;
  toast = '';
  error = '';
  newOrder = { customerId: 0, items: [{ productId: 0, quantity: 1 }] };
  customerMap: Record<number, string> = {};

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadOrders(); this.loadCustomerMap(); }

  loadCustomerMap() {
    this.http.get<any[]>('/api/customers').subscribe(data => {
      data.forEach(c => this.customerMap[c.id] = c.name);
    });
  }

  loadOrders() {
    this.http.get<any[]>('/api/orders').subscribe(data => { this.orders = data; this.filteredOrders = data; });
  }

  openCreateOrder() {
    this.http.get<any[]>('/api/customers').subscribe(data => this.availableCustomers = data);
    this.http.get<any[]>('/api/products').subscribe(data => this.availableProducts = data);
    this.newOrder = { customerId: 0, items: [{ productId: 0, quantity: 1 }] };
    this.showCreate = true;
  }

  addItem() { this.newOrder.items.push({ productId: 0, quantity: 1 }); }
  removeItem(i: number) { this.newOrder.items.splice(i, 1); }

  createOrder() {
    if (!this.newOrder.customerId) { this.showError('Select a customer'); return; }
    if (this.newOrder.items.some(i => !i.productId || i.quantity < 1)) { this.showError('Select products and quantities'); return; }
    this.saving = true;
    this.http.post('/api/orders', this.newOrder).subscribe({
      next: () => { this.showCreate = false; this.saving = false; this.loadOrders(); this.showToast('Order created successfully'); },
      error: (err) => { this.saving = false; this.showError(err.error?.error || err.error?.title || 'Failed to create order'); }
    });
  }

  updateStatus(orderId: number, status: string) {
    this.http.patch(`/api/orders/${orderId}/status`, { status }).subscribe({
      next: () => { this.loadOrders(); this.showToast(`Order #${orderId} updated to ${status}`); },
      error: (err) => { this.showError(err.error?.title || 'Failed to update status'); }
    });
  }

  filterOrders(event: Event) {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredOrders = this.orders.filter(o => (o.customerName || '').toLowerCase().includes(term) || o.status?.toLowerCase().includes(term) || o.id?.toString().includes(term));
  }

  getByStatus(status: string): number { return this.orders.filter(o => o.status?.toLowerCase() === status).length; }
  getTotalRevenue(): number { return this.orders.reduce((s, o) => s + (o.totalAmount || 0), 0); }
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) { case 'completed': return 'badge-success'; case 'pending': return 'badge-warning'; case 'cancelled': return 'badge-danger'; case 'processing': return 'badge-info'; default: return 'badge-gray'; }
  }

  showToast(msg: string) { this.toast = msg; setTimeout(() => this.toast = '', 3000); }
  showError(msg: string) { this.error = msg; setTimeout(() => this.error = '', 4000); }
}
