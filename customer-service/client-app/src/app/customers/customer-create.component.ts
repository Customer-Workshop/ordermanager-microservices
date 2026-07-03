import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerApiService } from './customer.service';
import { Customer } from './customer.model';

@Component({
  selector: 'app-customer-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Add Customer</h2>
    <p *ngIf="error" style="color:red">{{error}}</p>
    <form (ngSubmit)="submit()">
      <div><label>Name <input name="name" [(ngModel)]="model.name" required></label></div>
      <div><label>Email <input name="email" type="email" [(ngModel)]="model.email" required></label></div>
      <div><label>Phone <input name="phone" [(ngModel)]="model.phone"></label></div>
      <div><label>Address <input name="address" [(ngModel)]="model.address"></label></div>
      <div><label>City <input name="city" [(ngModel)]="model.city"></label></div>
      <div><label>State <input name="state" [(ngModel)]="model.state"></label></div>
      <div><label>Zip Code <input name="zipCode" [(ngModel)]="model.zipCode"></label></div>
      <button type="submit">Create</button>
    </form>
  `
})
export class CustomerCreateComponent {
  model: Partial<Customer> = { name: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '' };
  error = '';

  constructor(private api: CustomerApiService, private router: Router) {}

  submit() {
    this.error = '';
    this.api.create(this.model).subscribe({
      next: () => this.router.navigate(['/customers']),
      error: (err) => this.error = err?.error?.error ?? 'Failed to create customer.'
    });
  }
}
