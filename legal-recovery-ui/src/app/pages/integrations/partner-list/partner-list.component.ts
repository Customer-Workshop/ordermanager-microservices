import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../services/api.service';
import { IntegrationDashboard, IntegrationPartner } from '../../../models/integration.model';

@Component({
  selector: 'app-partner-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule, MatChipsModule, MatButtonModule, MatSlideToggleModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Integration Partners</h1>
        <p class="subtitle">Manage SFTP-to-API migration for 20-30 external integrations</p>
      </div>

      <div class="summary-cards" *ngIf="dashboard">
        <mat-card class="summary-stat">
          <span class="stat-number">{{ dashboard.totalPartners }}</span>
          <span class="stat-label">Total Partners</span>
        </mat-card>
        <mat-card class="summary-stat">
          <span class="stat-number active">{{ dashboard.activePartners }}</span>
          <span class="stat-label">Active</span>
        </mat-card>
        <mat-card class="summary-stat">
          <span class="stat-number sftp">{{ dashboard.sftpOnlyPartners }}</span>
          <span class="stat-label">SFTP Only</span>
        </mat-card>
        <mat-card class="summary-stat">
          <span class="stat-number api">{{ dashboard.apiPartners }}</span>
          <span class="stat-label">API</span>
        </mat-card>
        <mat-card class="summary-stat">
          <span class="stat-number dual">{{ dashboard.dualModePartners }}</span>
          <span class="stat-label">Dual Mode</span>
        </mat-card>
      </div>

      <mat-card *ngIf="dashboard" class="partners-table-card">
        <mat-card-content>
          <table mat-table [dataSource]="dashboard.partners" class="full-width">
            <ng-container matColumnDef="partnerName">
              <th mat-header-cell *matHeaderCellDef>Partner</th>
              <td mat-cell *matCellDef="let p">{{ p.partnerName }}</td>
            </ng-container>
            <ng-container matColumnDef="direction">
              <th mat-header-cell *matHeaderCellDef>Direction</th>
              <td mat-cell *matCellDef="let p">
                <mat-icon *ngIf="p.direction === 'Inbound'" class="direction-in">arrow_downward</mat-icon>
                <mat-icon *ngIf="p.direction === 'Outbound'" class="direction-out">arrow_upward</mat-icon>
                <mat-icon *ngIf="p.direction === 'Bidirectional'" class="direction-both">swap_vert</mat-icon>
                {{ p.direction }}
              </td>
            </ng-container>
            <ng-container matColumnDef="protocol">
              <th mat-header-cell *matHeaderCellDef>Protocol</th>
              <td mat-cell *matCellDef="let p">
                <mat-chip [class.sftp-chip]="p.protocol === 'SFTP'" [class.api-chip]="p.protocol === 'API'">
                  {{ p.protocol }}
                </mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="dataFormat">
              <th mat-header-cell *matHeaderCellDef>Format</th>
              <td mat-cell *matCellDef="let p">{{ p.dataFormat }}</td>
            </ng-container>
            <ng-container matColumnDef="frequency">
              <th mat-header-cell *matHeaderCellDef>Frequency</th>
              <td mat-cell *matCellDef="let p">{{ p.frequency }}</td>
            </ng-container>
            <ng-container matColumnDef="supportsApi">
              <th mat-header-cell *matHeaderCellDef>API Ready</th>
              <td mat-cell *matCellDef="let p">
                <mat-icon [class.ready]="p.supportsApi" [class.not-ready]="!p.supportsApi">
                  {{ p.supportsApi ? 'check_circle' : 'cancel' }}
                </mat-icon>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let p">
                <mat-chip [class.active-chip]="p.isActive" [class.inactive-chip]="!p.isActive">
                  {{ p.isActive ? 'Active' : 'Inactive' }}
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
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .summary-stat { padding: 20px; text-align: center; }
    .stat-number { font-size: 32px; font-weight: 600; display: block; color: #333; }
    .stat-number.active { color: #4caf50; }
    .stat-number.sftp { color: #ff9800; }
    .stat-number.api { color: #2196f3; }
    .stat-number.dual { color: #673ab7; }
    .stat-label { font-size: 12px; color: #777; text-transform: uppercase; }
    .full-width { width: 100%; }
    .direction-in { color: #4caf50; font-size: 18px; vertical-align: middle; }
    .direction-out { color: #2196f3; font-size: 18px; vertical-align: middle; }
    .direction-both { color: #ff9800; font-size: 18px; vertical-align: middle; }
    .sftp-chip { background: #fff3e0 !important; color: #e65100 !important; }
    .api-chip { background: #e3f2fd !important; color: #1565c0 !important; }
    .ready { color: #4caf50; }
    .not-ready { color: #ccc; }
    .active-chip { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .inactive-chip { background: #fce4ec !important; color: #c62828 !important; }
  `]
})
export class PartnerListComponent implements OnInit {
  dashboard: IntegrationDashboard | null = null;
  displayedColumns = ['partnerName', 'direction', 'protocol', 'dataFormat', 'frequency', 'supportsApi', 'status'];

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.api.getIntegrationDashboard().subscribe(d => this.dashboard = d);
  }
}
