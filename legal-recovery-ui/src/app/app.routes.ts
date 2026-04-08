import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { StateListComponent } from './pages/jurisdictions/state-list/state-list.component';
import { StateHierarchyComponent } from './pages/jurisdictions/state-hierarchy/state-hierarchy.component';
import { AccountListComponent } from './pages/accounts/account-list/account-list.component';
import { AttorneyListComponent } from './pages/attorneys/attorney-list/attorney-list.component';
import { TemplateListComponent } from './pages/documents/template-list/template-list.component';
import { MigrationDashboardComponent } from './pages/batch-migration/migration-dashboard/migration-dashboard.component';
import { PartnerListComponent } from './pages/integrations/partner-list/partner-list.component';
import { EFilingMatrixComponent } from './pages/filing/efiling-matrix/efiling-matrix.component';
import { GarnishmentListComponent } from './pages/garnishments/garnishment-list/garnishment-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'jurisdictions', component: StateListComponent },
  { path: 'jurisdictions/:stateId/hierarchy', component: StateHierarchyComponent },
  { path: 'accounts', component: AccountListComponent },
  { path: 'attorneys', component: AttorneyListComponent },
  { path: 'documents', component: TemplateListComponent },
  { path: 'batch-migration', component: MigrationDashboardComponent },
  { path: 'integrations', component: PartnerListComponent },
  { path: 'filing', component: EFilingMatrixComponent },
  { path: 'garnishments', component: GarnishmentListComponent },
  { path: '**', redirectTo: '/dashboard' },
];
