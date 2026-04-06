import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Inventory</h2>
    <div class="actions">
      <button (click)="loadAll()">All Items</button>
      <button (click)="loadLowStock()">Low Stock</button>
    </div>
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>Product</th>
          <th>On Hand</th>
          <th>Reorder Level</th>
          <th>Location</th>
          <th>Last Restocked</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let i of items" [class.low-stock]="i.quantityOnHand <= i.reorderLevel">
          <td>{{i.productName}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
          <td>{{i.lastRestocked | date}}</td>
          <td>
            <input type="number" [(ngModel)]="restockQuantity" min="1" placeholder="Qty" style="width:60px">
            <button (click)="restock(i.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">No inventory items found.</p>
  `,
  styles: [`
    h2 { color: #1a237e; margin-bottom: 16px; }
    .actions { margin-bottom: 16px; display: flex; gap: 8px; }
    .actions button {
      background: #1a237e; color: white; border: none;
      padding: 8px 20px; border-radius: 4px; cursor: pointer;
      font-size: 0.9rem; transition: background 0.2s;
    }
    .actions button:hover { background: #283593; }
    table {
      width: 100%; border-collapse: collapse;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    th {
      background: #e8eaf6; color: #1a237e; text-align: left;
      padding: 12px; font-size: 0.85rem; text-transform: uppercase;
      letter-spacing: 0.5px; border-bottom: 2px solid #c5cae9;
    }
    td { padding: 10px 12px; border-bottom: 1px solid #e0e0e0; }
    tr:hover { background: #f5f5f5; }
    tr.low-stock { background: #ffebee; }
    tr.low-stock:hover { background: #ffcdd2; }
    td input {
      width: 60px; padding: 4px 8px; border: 1px solid #bdbdbd;
      border-radius: 4px; margin-right: 6px;
    }
    td button {
      background: #43a047; color: white; border: none;
      padding: 5px 14px; border-radius: 4px; cursor: pointer;
      font-size: 0.85rem;
    }
    td button:hover { background: #388e3c; }
    p { color: #757575; font-style: italic; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  restockQuantity = 10;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.http.get<any[]>(`${this.apiUrl}/api/inventory`).subscribe(data => this.items = data);
  }

  loadLowStock() {
    this.http.get<any[]>(`${this.apiUrl}/api/inventory/low-stock`).subscribe(data => this.items = data);
  }

  restock(productId: number) {
    this.http.post<any>(`${this.apiUrl}/api/inventory/product/${productId}/restock`, { quantity: this.restockQuantity })
      .subscribe(() => this.loadAll());
  }
}
