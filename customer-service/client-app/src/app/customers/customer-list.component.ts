import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerApiService } from './customer.service';
import { Customer } from './customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Customers</h2>
    <table *ngIf="customers.length">
      <thead>
        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>City</th><th>Created</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of customers">
          <td>{{c.name}}</td>
          <td>{{c.email}}</td>
          <td>{{c.phone}}</td>
          <td>{{c.address}}</td>
          <td>{{c.city}}, {{c.state}} {{c.zipCode}}</td>
          <td>{{c.createdAt | date}}</td>
        </tr>
      </tbody>
    </table>
  `
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];

  constructor(private api: CustomerApiService) {}

  ngOnInit() {
    this.api.getAll().subscribe(data => this.customers = data);
  }
}
