import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { ApiService } from '../../services/api.service';
import { State } from '../../models/jurisdiction.model';
import { BatchDashboard } from '../../models/batch-migration.model';
import { IntegrationDashboard } from '../../models/integration.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatProgressBarModule, MatGridListModule],
  template: `
    <div class="dashboard-container">
      <h1>Legal Recovery Platform Dashboard</h1>

      <div class="summary-cards">
        <mat-card class="summary-card" routerLink="/jurisdictions">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon states">account_balance</mat-icon>
            <mat-card-title>{{ states.length }}</mat-card-title>
            <mat-card-subtitle>States</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ totalCounties }} counties, {{ totalCourthouses }} courthouses</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card" routerLink="/accounts">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon accounts">people</mat-icon>
            <mat-card-title>Accounts</mat-card-title>
            <mat-card-subtitle>Manage debtor accounts</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>View and manage recovery accounts</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card" routerLink="/attorneys">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon attorneys">gavel</mat-icon>
            <mat-card-title>Attorneys</mat-card-title>
            <mat-card-subtitle>Attorney management</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Bar admissions & courthouse credentials</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card" routerLink="/documents">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon documents">description</mat-icon>
            <mat-card-title>Documents</mat-card-title>
            <mat-card-subtitle>Template management</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>44,000+ document templates</p>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="detail-cards">
        <mat-card class="detail-card" *ngIf="batchDashboard">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon migration">sync</mat-icon>
            <mat-card-title>Batch-to-Event Migration</mat-card-title>
            <mat-card-subtitle>{{ batchDashboard.migrationProgressPercent | number:'1.1-1' }}% complete</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <mat-progress-bar mode="determinate" [value]="batchDashboard.migrationProgressPercent" color="primary"></mat-progress-bar>
            <div class="migration-stats">
              <div class="stat">
                <span class="stat-value">{{ batchDashboard.totalBatchJobs }}</span>
                <span class="stat-label">Total Jobs</span>
              </div>
              <div class="stat">
                <span class="stat-value migrated">{{ batchDashboard.migratedJobs }}</span>
                <span class="stat-label">Migrated</span>
              </div>
              <div class="stat">
                <span class="stat-value parallel">{{ batchDashboard.inParallelJobs }}</span>
                <span class="stat-label">In Parallel</span>
              </div>
              <div class="stat">
                <span class="stat-value remaining">{{ batchDashboard.remainingJobs }}</span>
                <span class="stat-label">Remaining</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="detail-card" *ngIf="integrationDashboard">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon integrations">settings_input_component</mat-icon>
            <mat-card-title>Integration Partners</mat-card-title>
            <mat-card-subtitle>{{ integrationDashboard.totalPartners }} partners</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="migration-stats">
              <div class="stat">
                <span class="stat-value">{{ integrationDashboard.activePartners }}</span>
                <span class="stat-label">Active</span>
              </div>
              <div class="stat">
                <span class="stat-value" style="color:#ff9800">{{ integrationDashboard.sftpOnlyPartners }}</span>
                <span class="stat-label">SFTP Only</span>
              </div>
              <div class="stat">
                <span class="stat-value" style="color:#4caf50">{{ integrationDashboard.apiPartners }}</span>
                <span class="stat-label">API</span>
              </div>
              <div class="stat">
                <span class="stat-value" style="color:#2196f3">{{ integrationDashboard.dualModePartners }}</span>
                <span class="stat-label">Dual Mode</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="process-stages">
        <h2>9 Process Stages</h2>
        <div class="stages-grid">
          <mat-card *ngFor="let stage of processStages; let i = index" class="stage-card">
            <div class="stage-number">{{ i + 1 }}</div>
            <div class="stage-info">
              <div class="stage-name">{{ stage.name }}</div>
              <div class="stage-desc">{{ stage.description }}</div>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; }
    h1 { margin: 0 0 24px; color: #333; font-weight: 400; }
    h2 { margin: 32px 0 16px; color: #555; font-weight: 400; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .summary-card { cursor: pointer; transition: box-shadow 0.2s; }
    .summary-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .card-icon { font-size: 32px; width: 48px; height: 48px; line-height: 48px; text-align: center; border-radius: 50%; color: #fff; }
    .card-icon.states { background: #3f51b5; }
    .card-icon.accounts { background: #009688; }
    .card-icon.attorneys { background: #795548; }
    .card-icon.documents { background: #ff5722; }
    .card-icon.migration { background: #673ab7; }
    .card-icon.integrations { background: #607d8b; }
    .detail-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 16px; margin-top: 24px; }
    .detail-card { }
    .migration-stats { display: flex; justify-content: space-around; margin-top: 16px; }
    .stat { text-align: center; }
    .stat-value { font-size: 28px; font-weight: 600; display: block; color: #333; }
    .stat-value.migrated { color: #4caf50; }
    .stat-value.parallel { color: #ff9800; }
    .stat-value.remaining { color: #f44336; }
    .stat-label { font-size: 12px; color: #777; text-transform: uppercase; }
    mat-progress-bar { margin-top: 8px; }
    .stages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
    .stage-card { display: flex; align-items: center; padding: 16px; }
    .stage-number {
      width: 36px; height: 36px; border-radius: 50%;
      background: #3f51b5; color: #fff; display: flex;
      align-items: center; justify-content: center;
      font-weight: 600; margin-right: 16px; flex-shrink: 0;
    }
    .stage-name { font-weight: 500; color: #333; }
    .stage-desc { font-size: 12px; color: #777; margin-top: 2px; }
  `]
})
export class DashboardComponent implements OnInit {
  states: State[] = [];
  batchDashboard: BatchDashboard | null = null;
  integrationDashboard: IntegrationDashboard | null = null;
  totalCounties = 0;
  totalCourthouses = 0;

  processStages = [
    { name: 'Account Selection', description: 'Evaluate accounts for legal recovery eligibility' },
    { name: 'Document Order & Fulfillment', description: 'Order and track required legal documents' },
    { name: 'Document Redaction', description: 'Redact PII from legal documents' },
    { name: 'Service of Process', description: 'Serve legal documents to debtors' },
    { name: 'Attorney Placement & Review', description: 'Assign attorneys based on jurisdiction' },
    { name: 'Court Appearance & Proceedings', description: 'Manage court appearances and hearings' },
    { name: 'Suit Filing', description: 'File suits via e-filing or physical submission' },
    { name: 'Judgment & Post-Judgment', description: 'Track judgments and post-judgment actions' },
    { name: 'Asset Garnishments', description: 'Issue and track garnishment writs' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getStates().subscribe(states => {
      this.states = states;
      this.totalCounties = states.reduce((sum, s) => sum + s.countyCount, 0);
      this.totalCourthouses = states.reduce((sum, s) => sum + s.courthouseCount, 0);
    });
    this.api.getBatchDashboard().subscribe(d => this.batchDashboard = d);
    this.api.getIntegrationDashboard().subscribe(d => this.integrationDashboard = d);
  }
}
