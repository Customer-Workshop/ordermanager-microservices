import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../services/api.service';
import { Garnishment } from '../../../models/garnishment.model';

@Component({
  selector: 'app-garnishment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatTableModule, MatChipsModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Asset Garnishments</h1>
        <p class="subtitle">Track and manage garnishment writs with courthouse-level template selection</p>
      </div>

      <mat-card class="lookup-card">
        <mat-card-header>
          <mat-card-title>Garnishment Lookup</mat-card-title>
          <mat-card-subtitle>Search garnishments by account ID</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="lookup-form">
            <mat-form-field appearance="outline">
              <mat-label>Account ID</mat-label>
              <input matInput [(ngModel)]="accountId" placeholder="Enter account UUID">
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="search()" [disabled]="!accountId">
              <mat-icon>search</mat-icon> Search
            </button>
          </div>
          <div class="sample-buttons">
            <span class="sample-label">Sample accounts:</span>
            <button mat-stroked-button *ngFor="let s of sampleAccounts" (click)="accountId = s.id; search()">
              {{ s.label }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="garnishments.length > 0" class="results-card">
        <mat-card-header>
          <mat-card-title>Garnishments ({{ garnishments.length }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="garnishments" class="full-width">
            <ng-container matColumnDef="accountNumber">
              <th mat-header-cell *matHeaderCellDef>Account</th>
              <td mat-cell *matCellDef="let g">{{ g.accountNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="debtorName">
              <th mat-header-cell *matHeaderCellDef>Debtor</th>
              <td mat-cell *matCellDef="let g">{{ g.debtorName }}</td>
            </ng-container>
            <ng-container matColumnDef="garnishmentType">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let g">{{ g.garnishmentType }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let g">\${{ g.amount | number:'1.2-2' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let g">
                <mat-chip>{{ g.status }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="issuedDate">
              <th mat-header-cell *matHeaderCellDef>Issued</th>
              <td mat-cell *matCellDef="let g">{{ g.issuedDate | date:'mediumDate' }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="searched && garnishments.length === 0" class="no-results">
        <mat-card-content>
          <mat-icon>info</mat-icon>
          <p>No garnishments found for this account.</p>
        </mat-card-content>
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
    .sample-buttons { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 8px; }
    .sample-label { color: #777; font-size: 13px; }
    .results-card { margin-top: 16px; }
    .full-width { width: 100%; }
    .no-results { text-align: center; padding: 24px; }
    .no-results mat-icon { font-size: 48px; color: #ccc; width: 48px; height: 48px; }
    .no-results p { color: #777; }
  `]
})
export class GarnishmentListComponent implements OnInit {
  accountId = '';
  garnishments: Garnishment[] = [];
  searched = false;
  displayedColumns = ['accountNumber', 'debtorName', 'garnishmentType', 'amount', 'status', 'issuedDate'];

  sampleAccounts = [
    { id: '55555555-5555-5555-5555-555555555001', label: 'Jane Doe' },
    { id: '55555555-5555-5555-5555-555555555005', label: 'Diana Chen' },
  ];

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}
  ngOnInit(): void {}

  search(): void {
    if (!this.accountId) return;
    this.searched = true;
    this.api.getAccountGarnishments(this.accountId).subscribe({
      next: (g) => this.garnishments = g,
      error: () => {
        this.garnishments = [];
        this.snackBar.open('Error fetching garnishments', 'Dismiss', { duration: 3000 });
      }
    });
  }
}
