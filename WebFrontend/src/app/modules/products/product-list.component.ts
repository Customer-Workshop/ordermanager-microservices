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
        <div class="stat-card"><div class="stat-icon purple">&#128722;</div><div class="stat-label">Total Products</div><div class="stat-value">{{ products.length }}</div></div>
        <div class="stat-card"><div class="stat-icon green">&#128181;</div><div class="stat-label">Avg. Price</div><div class="stat-value">{{ getAvgPrice() | currency }}</div></div>
        <div class="stat-card"><div class="stat-icon yellow">&#128193;</div><div class="stat-label">Categories</div><div class="stat-value">{{ getCategories().length }}</div></div>
        <div class="stat-card"><div class="stat-icon red">&#128200;</div><div class="stat-label">Total Value</div><div class="stat-value">{{ getTotalValue() | currency }}</div></div>
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
          <div class="empty-icon">&#128722;</div><h3>No products found</h3><p>Add your first product to get started.</p>
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
