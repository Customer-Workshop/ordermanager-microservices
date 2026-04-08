import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-efiling-matrix',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule, MatChipsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>E-Filing & Suit Filing</h1>
        <p class="subtitle">E-filing capability matrix for 9,000+ courthouses</p>
      </div>

      <mat-card *ngIf="matrix">
        <mat-card-header>
          <mat-card-title>E-Filing Matrix</mat-card-title>
          <mat-card-subtitle>Courthouse filing capabilities</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-value">{{ matrix.totalCourthouses }}</span>
              <span class="stat-label">Total Courthouses</span>
            </div>
            <div class="stat">
              <span class="stat-value required">{{ matrix.eFilingRequired }}</span>
              <span class="stat-label">E-Filing Required</span>
            </div>
            <div class="stat">
              <span class="stat-value available">{{ matrix.eFilingAvailable }}</span>
              <span class="stat-label">E-Filing Available</span>
            </div>
            <div class="stat">
              <span class="stat-value none">{{ matrix.noEFiling }}</span>
              <span class="stat-label">No E-Filing</span>
            </div>
          </div>

          <table mat-table [dataSource]="matrix.courthouses" class="full-width" *ngIf="matrix.courthouses">
            <ng-container matColumnDef="courthouseName">
              <th mat-header-cell *matHeaderCellDef>Courthouse</th>
              <td mat-cell *matCellDef="let c">{{ c.courthouseName }}</td>
            </ng-container>
            <ng-container matColumnDef="stateName">
              <th mat-header-cell *matHeaderCellDef>State</th>
              <td mat-cell *matCellDef="let c">{{ c.stateName }}</td>
            </ng-container>
            <ng-container matColumnDef="countyName">
              <th mat-header-cell *matHeaderCellDef>County</th>
              <td mat-cell *matCellDef="let c">{{ c.countyName }}</td>
            </ng-container>
            <ng-container matColumnDef="eFilingStatus">
              <th mat-header-cell *matHeaderCellDef>E-Filing Status</th>
              <td mat-cell *matCellDef="let c">
                <mat-chip [class.efiling-required]="c.eFilingStatus === 'Required'"
                          [class.efiling-available]="c.eFilingStatus === 'Available'"
                          [class.efiling-none]="c.eFilingStatus === 'NotAvailable'">
                  <mat-icon class="chip-icon">{{ getEFilingIcon(c.eFilingStatus) }}</mat-icon>
                  {{ c.eFilingStatus }}
                </mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="filingFee">
              <th mat-header-cell *matHeaderCellDef>Filing Fee</th>
              <td mat-cell *matCellDef="let c">{{ c.filingFee ? ('$' + c.filingFee) : 'N/A' }}</td>
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
    .summary-stats { display: flex; justify-content: space-around; margin: 16px 0 24px; padding: 16px; background: #fafafa; border-radius: 8px; }
    .stat { text-align: center; }
    .stat-value { font-size: 28px; font-weight: 600; display: block; color: #333; }
    .stat-value.required { color: #4caf50; }
    .stat-value.available { color: #2196f3; }
    .stat-value.none { color: #f44336; }
    .stat-label { font-size: 12px; color: #777; text-transform: uppercase; }
    .full-width { width: 100%; }
    .efiling-required { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .efiling-available { background: #e3f2fd !important; color: #1565c0 !important; }
    .efiling-none { background: #fce4ec !important; color: #c62828 !important; }
    .chip-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; }
  `]
})
export class EFilingMatrixComponent implements OnInit {
  matrix: any = null;
  displayedColumns = ['courthouseName', 'stateName', 'countyName', 'eFilingStatus', 'filingFee'];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getEFilingMatrix().subscribe(m => this.matrix = m);
  }

  getEFilingIcon(status: string): string {
    switch (status) {
      case 'Required': return 'verified';
      case 'Available': return 'check_circle';
      default: return 'cancel';
    }
  }
}
