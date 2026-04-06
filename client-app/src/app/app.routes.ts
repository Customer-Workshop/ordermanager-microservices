import { Routes } from '@angular/router';
import { InventoryListComponent } from './modules/inventory/inventory-list.component';
import { LowStockComponent } from './modules/inventory/low-stock.component';

export const routes: Routes = [
  { path: '', component: InventoryListComponent },
  { path: 'low-stock', component: LowStockComponent },
];
