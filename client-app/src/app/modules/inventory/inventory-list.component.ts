import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Inventory</h2>
    <table *ngIf="items.length">
      <thead><tr><th>Product</th><th>On Hand</th><th>Reorder Level</th><th>Location</th><th>Last Restocked</th></tr></thead>
      <tbody>
        <tr *ngFor="let i of items" [class.low-stock]="i.quantityOnHand <= i.reorderLevel">
          <td>{{i.productName}}</td><td>{{i.quantityOnHand}}</td><td>{{i.reorderLevel}}</td><td>{{i.warehouseLocation}}</td><td>{{i.lastRestocked | date}}</td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="!items.length && !loading">No inventory items found.</div>
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="error" class="error">{{error}}</div>
  `,
  styles: [`
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f5f5f5; font-weight: 600; }
    .low-stock { background-color: #fff3cd; }
    .error { color: #dc3545; margin-top: 1rem; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  loading = true;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/api/inventory`).subscribe({
      next: data => { this.items = data; this.loading = false; },
      error: err => { this.error = 'Failed to load inventory'; this.loading = false; }
    });
  }
}
