import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h2>Customers</h2><p>Manage your customer directory</p></div>
      <div class="stats-row">
        <div class="stat-card"><div class="stat-icon purple"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div class="stat-label">Total Customers</div><div class="stat-value">{{ customers.length }}</div></div>
        <div class="stat-card"><div class="stat-icon green"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div><div class="stat-label">Cities</div><div class="stat-value">{{ getCities().length }}</div></div>
        <div class="stat-card"><div class="stat-icon yellow"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div><div class="stat-label">States</div><div class="stat-value">{{ getStates().length }}</div></div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>All Customers</h3>
          <div style="display:flex;gap:8px;align-items:center">
            <input class="search-input" placeholder="Search customers..." (input)="filterCustomers($event)">
            <button class="btn btn-primary" (click)="showCreate = true">+ New Customer</button>
          </div>
        </div>
        <table *ngIf="filteredCustomers.length">
          <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Location</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of filteredCustomers">
              <td><div style="display:flex;align-items:center;gap:10px"><div class="customer-avatar">{{ getInitials(c.name) }}</div><span class="font-medium">{{ c.name }}</span></div></td>
              <td><span class="text-gray">{{ c.email }}</span></td>
              <td class="font-mono">{{ c.phone }}</td>
              <td><span class="font-medium">{{ c.city }}, {{ c.state }}</span></td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!filteredCustomers.length" class="empty-state">
          <div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><h3>No customers found</h3><p>Add your first customer to get started.</p>
        </div>
      </div>
    </div>

    <!-- Create Customer Modal -->
    <div class="modal-backdrop" *ngIf="showCreate" (click)="showCreate = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>New Customer</h3><button class="modal-close" (click)="showCreate = false">&times;</button></div>
        <div class="modal-body">
          <div class="form-group"><label>Company Name</label><input class="form-control" [(ngModel)]="newCustomer.name" placeholder="e.g. Acme Corp"></div>
          <div class="form-row">
            <div class="form-group"><label>Email</label><input class="form-control" type="email" [(ngModel)]="newCustomer.email" placeholder="orders@acme.com"></div>
            <div class="form-group"><label>Phone</label><input class="form-control" [(ngModel)]="newCustomer.phone" placeholder="555-0100"></div>
          </div>
          <div class="form-group"><label>Address</label><input class="form-control" [(ngModel)]="newCustomer.address" placeholder="123 Main St"></div>
          <div class="form-row">
            <div class="form-group"><label>City</label><input class="form-control" [(ngModel)]="newCustomer.city" placeholder="Springfield"></div>
            <div class="form-group"><label>State</label><input class="form-control" [(ngModel)]="newCustomer.state" placeholder="IL"></div>
          </div>
          <div class="form-group"><label>Zip Code</label><input class="form-control" [(ngModel)]="newCustomer.zipCode" placeholder="62701"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="showCreate = false">Cancel</button>
          <button class="btn btn-primary" (click)="createCustomer()" [disabled]="saving">{{ saving ? 'Saving...' : 'Create Customer' }}</button>
        </div>
      </div>
    </div>

    <div class="toast toast-success" *ngIf="toast">{{ toast }}</div>
    <div class="toast toast-error" *ngIf="error">{{ error }}</div>
  `,
  styles: [`.customer-avatar { width: 36px; height: 36px; border-radius: 9999px; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }`]
})
export class CustomerListComponent implements OnInit {
  customers: any[] = [];
  filteredCustomers: any[] = [];
  showCreate = false;
  saving = false;
  toast = '';
  error = '';
  newCustomer = { name: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '' };

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadCustomers(); }

  loadCustomers() {
    this.http.get<any[]>('/api/customers').subscribe(data => { this.customers = data; this.filteredCustomers = data; });
  }

  filterCustomers(event: Event) {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredCustomers = this.customers.filter(c => c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || c.city?.toLowerCase().includes(term));
  }

  createCustomer() {
    if (!this.newCustomer.name || !this.newCustomer.email) { this.showError('Name and Email are required'); return; }
    this.saving = true;
    this.http.post('/api/customers', this.newCustomer).subscribe({
      next: () => { this.showCreate = false; this.saving = false; this.newCustomer = { name: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '' }; this.loadCustomers(); this.showToast('Customer created successfully'); },
      error: (err) => { this.saving = false; this.showError(err.error?.title || 'Failed to create customer'); }
    });
  }

  getInitials(name: string): string { return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(); }
  getCities(): string[] { return [...new Set(this.customers.map(c => c.city).filter(Boolean))] as string[]; }
  getStates(): string[] { return [...new Set(this.customers.map(c => c.state).filter(Boolean))] as string[]; }

  showToast(msg: string) { this.toast = msg; setTimeout(() => this.toast = '', 3000); }
  showError(msg: string) { this.error = msg; setTimeout(() => this.error = '', 4000); }
}
