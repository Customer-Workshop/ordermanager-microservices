import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../services/api.service';
import { Account } from '../../../models/account.model';
import { State } from '../../../models/jurisdiction.model';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatTableModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatInputModule, MatFormFieldModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Accounts</h1>
        <p class="subtitle">Manage debtor accounts across all process stages</p>
      </div>

      <mat-card class="lookup-card">
        <mat-card-header>
          <mat-card-title>Account Lookup</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="lookup-form">
            <mat-form-field appearance="outline">
              <mat-label>Account ID</mat-label>
              <input matInput [(ngModel)]="accountId" placeholder="Enter account UUID">
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="lookupAccount()" [disabled]="!accountId">
              <mat-icon>search</mat-icon> Look Up
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="quick-lookup" *ngIf="sampleAccountIds.length > 0">
        <mat-card-header>
          <mat-card-title>Sample Accounts</mat-card-title>
          <mat-card-subtitle>Click to view seeded accounts from database</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="sample-buttons">
            <button mat-stroked-button *ngFor="let sample of sampleAccountIds" (click)="accountId = sample.id; lookupAccount()">
              <mat-icon>person</mat-icon> {{ sample.label }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="account" class="account-detail-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="account-icon">person</mat-icon>
          <mat-card-title>{{ account.debtorName }}</mat-card-title>
          <mat-card-subtitle>{{ account.accountNumber }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Original Balance</span>
              <span class="value">\${{ account.originalBalance | number:'1.2-2' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Current Balance</span>
              <span class="value">\${{ account.currentBalance | number:'1.2-2' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Product Type</span>
              <span class="value">{{ account.productType }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Status</span>
              <mat-chip class="status-chip">{{ account.status }}</mat-chip>
            </div>
            <div class="detail-item">
              <span class="label">Current Stage</span>
              <mat-chip color="primary">{{ account.currentStage }}</mat-chip>
            </div>
            <div class="detail-item" *ngIf="account.selectionScore">
              <span class="label">Selection Score</span>
              <span class="value">{{ account.selectionScore }}</span>
            </div>
            <div class="detail-item">
              <span class="label">State</span>
              <span class="value">{{ account.stateName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">County</span>
              <span class="value">{{ account.countyName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Courthouse</span>
              <span class="value">{{ account.courthouseName }}</span>
            </div>
            <div class="detail-item" *ngIf="account.attorneyName">
              <span class="label">Attorney</span>
              <span class="value">{{ account.attorneyName }}</span>
            </div>
            <div class="detail-item" *ngIf="account.caseNumber">
              <span class="label">Case Number</span>
              <span class="value">{{ account.caseNumber }}</span>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary" (click)="evaluateSelection()">
            <mat-icon>assessment</mat-icon> Evaluate Selection
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header h1 { margin: 0; color: #333; font-weight: 400; }
    .subtitle { color: #777; margin: 4px 0 24px; }
    .lookup-card { margin-bottom: 16px; }
    .lookup-form { display: flex; align-items: center; gap: 16px; }
    .lookup-form mat-form-field { flex: 1; }
    .quick-lookup { margin-bottom: 16px; }
    .sample-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
    .account-detail-card { margin-top: 16px; }
    .account-icon { font-size: 32px; width: 48px; height: 48px; line-height: 48px; text-align: center; border-radius: 50%; background: #009688; color: #fff; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-top: 16px; }
    .detail-item { display: flex; flex-direction: column; }
    .label { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 4px; }
    .value { font-size: 16px; font-weight: 500; color: #333; }
    .status-chip { font-size: 12px; }
  `]
})
export class AccountListComponent implements OnInit {
  accountId = '';
  account: Account | null = null;

  sampleAccountIds = [
    { id: '55555555-5555-5555-5555-555555555001', label: 'Jane Doe (ACC-2024-001)' },
    { id: '55555555-5555-5555-5555-555555555002', label: 'Bob Smith (ACC-2024-002)' },
    { id: '55555555-5555-5555-5555-555555555003', label: 'Alice Johnson (ACC-2024-003)' },
    { id: '55555555-5555-5555-5555-555555555004', label: 'Carlos Rivera (ACC-2024-004)' },
    { id: '55555555-5555-5555-5555-555555555005', label: 'Diana Chen (ACC-2024-005)' },
  ];

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  lookupAccount(): void {
    if (!this.accountId) return;
    this.api.getAccount(this.accountId).subscribe({
      next: (account) => this.account = account,
      error: () => this.snackBar.open('Account not found', 'Dismiss', { duration: 3000 })
    });
  }

  evaluateSelection(): void {
    if (!this.account) return;
    this.api.evaluateSelection(this.account.id).subscribe({
      next: () => {
        this.snackBar.open('Selection evaluation triggered', 'OK', { duration: 3000 });
        this.lookupAccount();
      },
      error: (err) => this.snackBar.open('Error: ' + (err.error?.title || 'Unknown'), 'Dismiss', { duration: 3000 })
    });
  }
}
