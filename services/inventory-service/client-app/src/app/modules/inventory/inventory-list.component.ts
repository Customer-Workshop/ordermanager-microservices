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
    <h2>Inventory Management</h2>
    <div class="actions">
      <button (click)="checkLowStock()">Check Low Stock</button>
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
        <tr *ngFor="let item of items" [class.low-stock]="item.quantityOnHand <= item.reorderLevel">
          <td>{{ item.productName }}</td>
          <td>{{ item.quantityOnHand }}</td>
          <td>{{ item.reorderLevel }}</td>
          <td>{{ item.warehouseLocation }}</td>
          <td>{{ item.lastRestocked | date:'short' }}</td>
          <td>
            <input type="number" [(ngModel)]="restockQty" min="1" placeholder="Qty" style="width:60px">
            <button (click)="restock(item.productId)">Restock</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length">No inventory items found.</p>
  `,
  styles: [\`
    .low-stock { background-color: #ffe0e0; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
    .actions { margin-bottom: 1rem; }
    button { margin-right: 0.5rem; padding: 4px 12px; cursor: pointer; }
  \`]
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  restockQty = 10;
  private apiUrl = environment.apiUrl || '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.http.get<any[]>(\`\${this.apiUrl}/api/inventory\`).subscribe(data => this.items = data);
  }

  restock(productId: number) {
    this.http.post(\`\${this.apiUrl}/api/inventory/product/\${productId}/restock\`, { quantity: this.restockQty })
      .subscribe(() => this.loadInventory());
  }

  checkLowStock() {
    this.http.get<any[]>(\`\${this.apiUrl}/api/inventory/low-stock\`).subscribe(data => this.items = data);
  }
}
