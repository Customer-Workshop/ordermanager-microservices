import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h2>Products</h2><p>Manage your product catalog</p></div>
      <div class="stats-row">
        <div class="stat-card"><div class="stat-icon purple"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div><div class="stat-label">Total Products</div><div class="stat-value">{{ products.length }}</div></div>
        <div class="stat-card"><div class="stat-icon green"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div class="stat-label">Avg. Price</div><div class="stat-value">{{ getAvgPrice() | currency }}</div></div>
        <div class="stat-card"><div class="stat-icon yellow"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div><div class="stat-label">Categories</div><div class="stat-value">{{ getCategories().length }}</div></div>
        <div class="stat-card"><div class="stat-icon red"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div><div class="stat-label">Total Value</div><div class="stat-value">{{ getTotalValue() | currency }}</div></div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>All Products</h3>
          <div style="display:flex;gap:8px;align-items:center">
            <input class="search-input" placeholder="Search products..." (input)="filterProducts($event)">
            <button class="btn btn-primary" (click)="showCreate = true">+ New Product</button>
          </div>
        </div>
        <table *ngIf="filteredProducts.length">
          <thead><tr><th>SKU</th><th>Product Name</th><th>Category</th><th class="text-right">Price</th><th class="text-right">In Stock</th><th>Status</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of filteredProducts">
              <td class="font-mono">{{ p.sku }}</td>
              <td><div class="product-name"><span class="font-medium">{{ p.name }}</span><span class="text-gray" style="font-size:12px">{{ p.description }}</span></div></td>
              <td><span class="badge badge-info">{{ p.category }}</span></td>
              <td class="text-right font-medium">{{ p.price | currency }}</td>
              <td class="text-right font-mono">{{ p.inventory?.quantityOnHand ?? 'N/A' }}</td>
              <td><span class="badge" [ngClass]="getStockBadge(p)">{{ getStockLabel(p) }}</span></td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!filteredProducts.length" class="empty-state">
          <div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div><h3>No products found</h3><p>Add your first product to get started.</p>
        </div>
      </div>
    </div>

    <!-- Create Product Modal -->
    <div class="modal-backdrop" *ngIf="showCreate" (click)="showCreate = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>New Product</h3><button class="modal-close" (click)="showCreate = false">&times;</button></div>
        <div class="modal-body">
          <div class="form-group"><label>Product Name</label><input class="form-control" [(ngModel)]="newProduct.name" placeholder="e.g. Widget Pro"></div>
          <div class="form-row">
            <div class="form-group"><label>SKU</label><input class="form-control" [(ngModel)]="newProduct.sku" placeholder="e.g. WGT-003"></div>
            <div class="form-group"><label>Category</label><input class="form-control" [(ngModel)]="newProduct.category" placeholder="e.g. Widgets"></div>
          </div>
          <div class="form-group"><label>Description</label><input class="form-control" [(ngModel)]="newProduct.description" placeholder="Short description"></div>
          <div class="form-group"><label>Price</label><input class="form-control" type="number" step="0.01" [(ngModel)]="newProduct.price" placeholder="0.00"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="showCreate = false">Cancel</button>
          <button class="btn btn-primary" (click)="createProduct()" [disabled]="saving">{{ saving ? 'Saving...' : 'Create Product' }}</button>
        </div>
      </div>
    </div>

    <div class="toast toast-success" *ngIf="toast">{{ toast }}</div>
    <div class="toast toast-error" *ngIf="error">{{ error }}</div>
  `,
  styles: [`.product-name { display: flex; flex-direction: column; gap: 2px; }`]
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  showCreate = false;
  saving = false;
  toast = '';
  error = '';
  newProduct = { name: '', sku: '', category: '', description: '', price: 0 };

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.http.get<any[]>('/api/products').subscribe(data => { this.products = data; this.filteredProducts = data; });
  }

  filterProducts(event: Event) {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProducts = this.products.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));
  }

  createProduct() {
    if (!this.newProduct.name || !this.newProduct.sku) { this.showError('Name and SKU are required'); return; }
    this.saving = true;
    this.http.post('/api/products', this.newProduct).subscribe({
      next: () => { this.showCreate = false; this.saving = false; this.newProduct = { name: '', sku: '', category: '', description: '', price: 0 }; this.loadProducts(); this.showToast('Product created successfully'); },
      error: (err) => { this.saving = false; this.showError(err.error?.title || 'Failed to create product'); }
    });
  }

  getAvgPrice(): number { return this.products.length ? this.products.reduce((s, p) => s + p.price, 0) / this.products.length : 0; }
  getCategories(): string[] { return [...new Set(this.products.map(p => p.category))] as string[]; }
  getTotalValue(): number { return this.products.reduce((s, p) => s + (p.price * (p.inventory?.quantityOnHand || 0)), 0); }
  getStockBadge(p: any): string { const q = p.inventory?.quantityOnHand ?? 0; return q === 0 ? 'badge-danger' : q <= 20 ? 'badge-warning' : 'badge-success'; }
  getStockLabel(p: any): string { const q = p.inventory?.quantityOnHand ?? 0; return q === 0 ? 'Out of Stock' : q <= 20 ? 'Low Stock' : 'In Stock'; }

  showToast(msg: string) { this.toast = msg; setTimeout(() => this.toast = '', 3000); }
  showError(msg: string) { this.error = msg; setTimeout(() => this.error = '', 4000); }
}
