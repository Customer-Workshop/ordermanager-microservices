import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./modules/inventory/inventory-list.component').then(m => m.InventoryListComponent) },
];
