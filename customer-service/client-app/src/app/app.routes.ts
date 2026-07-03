import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/customers', pathMatch: 'full' },
  { path: 'customers', loadComponent: () => import('./customers/customer-list.component').then(m => m.CustomerListComponent) },
  { path: 'customers/new', loadComponent: () => import('./customers/customer-create.component').then(m => m.CustomerCreateComponent) },
];
