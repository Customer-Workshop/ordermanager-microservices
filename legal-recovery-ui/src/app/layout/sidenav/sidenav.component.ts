import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: `
    <mat-nav-list>
      <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
        <mat-icon matListItemIcon>dashboard</mat-icon>
        <span matListItemTitle>Dashboard</span>
      </a>
      <a mat-list-item routerLink="/jurisdictions" routerLinkActive="active">
        <mat-icon matListItemIcon>account_balance</mat-icon>
        <span matListItemTitle>Jurisdictions</span>
      </a>
      <a mat-list-item routerLink="/accounts" routerLinkActive="active">
        <mat-icon matListItemIcon>people</mat-icon>
        <span matListItemTitle>Accounts</span>
      </a>
      <a mat-list-item routerLink="/attorneys" routerLinkActive="active">
        <mat-icon matListItemIcon>gavel</mat-icon>
        <span matListItemTitle>Attorneys</span>
      </a>
      <a mat-list-item routerLink="/documents" routerLinkActive="active">
        <mat-icon matListItemIcon>description</mat-icon>
        <span matListItemTitle>Documents</span>
      </a>
      <a mat-list-item routerLink="/batch-migration" routerLinkActive="active">
        <mat-icon matListItemIcon>sync</mat-icon>
        <span matListItemTitle>Batch Migration</span>
      </a>
      <a mat-list-item routerLink="/integrations" routerLinkActive="active">
        <mat-icon matListItemIcon>settings_input_component</mat-icon>
        <span matListItemTitle>Integrations</span>
      </a>
      <a mat-list-item routerLink="/filing" routerLinkActive="active">
        <mat-icon matListItemIcon>folder_open</mat-icon>
        <span matListItemTitle>Filing</span>
      </a>
      <a mat-list-item routerLink="/garnishments" routerLinkActive="active">
        <mat-icon matListItemIcon>attach_money</mat-icon>
        <span matListItemTitle>Garnishments</span>
      </a>
    </mat-nav-list>
  `,
  styles: [`
    .active { background: rgba(63, 81, 181, 0.12); }
    mat-nav-list { padding-top: 0; }
  `]
})
export class SidenavComponent {}
