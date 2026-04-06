import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { InventoryListComponent } from './app/modules/inventory/inventory-list.component';

bootstrapApplication(InventoryListComponent, {
  providers: [provideHttpClient()]
});
