import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./modules/inventory/inventory-list.component').then(m => m.InventoryListComponent) },
  { path: 'low-stock', loadComponent: () => import('./modules/inventory/low-stock.component').then(m => m.LowStockComponent) }
];
