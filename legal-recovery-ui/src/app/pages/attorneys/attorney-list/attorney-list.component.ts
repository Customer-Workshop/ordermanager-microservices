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
import { EligibleAttorney } from '../../../models/attorney.model';

@Component({
  selector: 'app-attorney-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatTableModule, MatChipsModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Attorney Management</h1>
        <p class="subtitle">Manage attorneys and their courthouse-level bar admissions</p>
      </div>

      <mat-card class="lookup-card">
        <mat-card-header>
          <mat-card-title>Find Eligible Attorneys</mat-card-title>
          <mat-card-subtitle>Look up attorneys eligible for a specific courthouse</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="lookup-form">
            <mat-form-field appearance="outline">
              <mat-label>Courthouse ID</mat-label>
              <input matInput [(ngModel)]="courthouseId" placeholder="Enter courthouse UUID">
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="findEligible()" [disabled]="!courthouseId">
              <mat-icon>search</mat-icon> Find Eligible
            </button>
          </div>
          <div class="sample-buttons">
            <span class="sample-label">Sample courthouses:</span>
            <button mat-stroked-button *ngFor="let s of sampleCourthouses" (click)="courthouseId = s.id; findEligible()">
              {{ s.label }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="attorneys.length > 0" class="results-card">
        <mat-card-header>
          <mat-card-title>Eligible Attorneys ({{ attorneys.length }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="attorneys" class="full-width">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let a">{{ a.name }}</td>
            </ng-container>
            <ng-container matColumnDef="barNumber">
              <th mat-header-cell *matHeaderCellDef>Bar Number</th>
              <td mat-cell *matCellDef="let a">{{ a.barNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="firmName">
              <th mat-header-cell *matHeaderCellDef>Firm</th>
              <td mat-cell *matCellDef="let a">{{ a.firmName }}</td>
            </ng-container>
            <ng-container matColumnDef="caseLoad">
              <th mat-header-cell *matHeaderCellDef>Case Load</th>
              <td mat-cell *matCellDef="let a">{{ a.currentCaseCount }} / {{ a.maxCaseLoad }}</td>
            </ng-container>
            <ng-container matColumnDef="localCounsel">
              <th mat-header-cell *matHeaderCellDef>Local Counsel</th>
              <td mat-cell *matCellDef="let a">
                <mat-chip [class.yes-chip]="a.isLocalCounsel" [class.no-chip]="!a.isLocalCounsel">
                  {{ a.isLocalCounsel ? 'Yes' : 'No' }}
                </mat-chip>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
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
    .yes-chip { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .no-chip { background: #fafafa !important; color: #999 !important; }
  `]
})
export class AttorneyListComponent implements OnInit {
  courthouseId = '';
  attorneys: EligibleAttorney[] = [];
  displayedColumns = ['name', 'barNumber', 'firmName', 'caseLoad', 'localCounsel'];

  sampleCourthouses = [
    { id: '33333333-3333-3333-3333-333333333001', label: 'LA Superior Court' },
    { id: '33333333-3333-3333-3333-333333333003', label: 'SD Superior Court' },
    { id: '33333333-3333-3333-3333-333333333004', label: 'Harris County Court' },
  ];

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}
  ngOnInit(): void {}

  findEligible(): void {
    if (!this.courthouseId) return;
    this.api.getEligibleAttorneys(this.courthouseId).subscribe({
      next: (attorneys) => this.attorneys = attorneys,
      error: () => this.snackBar.open('Error fetching attorneys', 'Dismiss', { duration: 3000 })
    });
  }
}
