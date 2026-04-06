import { Routes } from '@angular/router';
import { InventoryListComponent } from './modules/inventory/inventory-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inventory', pathMatch: 'full' },
  { path: 'inventory', component: InventoryListComponent }
];
