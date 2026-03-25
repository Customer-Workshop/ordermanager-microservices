import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/inventory', pathMatch: 'full' },
  { path: 'inventory', loadComponent: () => import('./modules/inventory-list/inventory-list.component').then(m => m.InventoryListComponent) },
  { path: 'low-stock', loadComponent: () => import('./modules/low-stock-alerts/low-stock-alerts.component').then(m => m.LowStockAlertsComponent) },
  { path: 'restock', loadComponent: () => import('./modules/inventory-restock/inventory-restock.component').then(m => m.InventoryRestockComponent) },
];
