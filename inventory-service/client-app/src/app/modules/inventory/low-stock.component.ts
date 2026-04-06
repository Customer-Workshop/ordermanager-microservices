import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Low Stock Items</h2>
    <ul><li *ngFor="let item of items">{{item.productName}} — {{item.quantityOnHand}} remaining (reorder at {{item.reorderLevel}})</li></ul>
    <p *ngIf="!items.length">No low stock items.</p>
  `
})
export class LowStockComponent implements OnInit {
  items: any[] = [];
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/api/inventory/low-stock`).subscribe(data => this.items = data);
  }
}
