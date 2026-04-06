import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Inventory Items</h2>
    <table>
      <thead><tr>
        <th>Product</th><th>Qty</th><th>Reorder Level</th><th>Location</th><th>Last Restocked</th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let i of items" [class.low-stock]="i.quantityOnHand <= i.reorderLevel">
          <td>{{i.productName}}</td>
          <td>{{i.quantityOnHand}}</td>
          <td>{{i.reorderLevel}}</td>
          <td>{{i.warehouseLocation}}</td>
          <td>{{i.lastRestocked | date:'short'}}</td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
    .low-stock { background-color: #ffe0e0; }
  `]
})
export class InventoryListComponent implements OnInit {
  items: any[] = [];
  private apiUrl = environment.apiUrl || '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>(`${this.apiUrl}/api/inventory`).subscribe(data => this.items = data);
  }
}
