import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inventory-restock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Restock Inventory</h2>
    <div class="restock-form">
      <label>Product ID:
        <input type="number" [(ngModel)]="productId" min="1" />
      </label>
      <label>Quantity to Add:
        <input type="number" [(ngModel)]="quantity" min="1" />
      </label>
      <button (click)="restock()" [disabled]="!productId || !quantity || loading">Restock</button>
    </div>
    <div *ngIf="message" class="message" [class.success]="success" [class.error]="!success">
      {{message}}
    </div>
    <h3>Current Inventory</h3>
    <table *ngIf="items.length">
      <thead><tr><th>Product ID</th><th>Product</th><th>On Hand</th><th>Location</th></tr></thead>
      <tbody>
        <tr *ngFor="let i of items">
          <td>{{i.productId}}</td><td>{{i.productName}}</td><td>{{i.quantityOnHand}}</td><td>{{i.warehouseLocation}}</td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
    .restock-form { display: flex; gap: 1rem; align-items: end; margin: 1rem 0; }
    label { display: flex; flex-direction: column; gap: 0.25rem; }
    input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #ccc; }
    .message { margin: 1rem 0; padding: 0.75rem; border-radius: 4px; }
    .success { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f5f5f5; }
  `]
})
export class InventoryRestockComponent implements OnInit {
  items: InventoryItem[] = [];
  productId: number | null = null;
  quantity: number | null = null;
  message = '';
  success = false;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadInventory(); }

  loadInventory() {
    this.http.get<InventoryItem[]>(`${environment.apiUrl}/api/inventory`).subscribe(data => this.items = data);
  }

  restock() {
    if (!this.productId || !this.quantity) return;
    this.loading = true;
    this.http.post<InventoryItem>(`${environment.apiUrl}/api/inventory/product/${this.productId}/restock`, { quantity: this.quantity }).subscribe({
      next: (item) => {
        this.message = `Restocked product ${item.productName} — now ${item.quantityOnHand} on hand.`;
        this.success = true;
        this.loading = false;
        this.loadInventory();
      },
      error: (err) => {
        this.message = err.error?.error || 'Restock failed.';
        this.success = false;
        this.loading = false;
      }
    });
  }
}

interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  quantityOnHand: number;
  reorderLevel: number;
  warehouseLocation: string;
}
