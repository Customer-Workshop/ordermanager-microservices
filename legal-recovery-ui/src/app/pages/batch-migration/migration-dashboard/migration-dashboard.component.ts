import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../../services/api.service';
import { BatchDashboard } from '../../../models/batch-migration.model';

@Component({
  selector: 'app-migration-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatChipsModule],
  template: `
    <div class="page-container" *ngIf="dashboard">
      <div class="page-header">
        <h1>Batch-to-Event Migration Dashboard</h1>
        <p class="subtitle">Track the migration of {{ dashboard.totalBatchJobs }} batch jobs to event-driven architecture</p>
      </div>

      <div class="progress-section">
        <mat-card>
          <mat-card-content>
            <div class="progress-header">
              <h2>Overall Progress</h2>
              <span class="progress-percent">{{ dashboard.migrationProgressPercent | number:'1.1-1' }}%</span>
            </div>
            <mat-progress-bar mode="determinate" [value]="dashboard.migrationProgressPercent" color="primary"></mat-progress-bar>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <div class="stat-icon total"><mat-icon>list</mat-icon></div>
          <div class="stat-info">
            <span class="stat-number">{{ dashboard.totalBatchJobs }}</span>
            <span class="stat-label">Total Batch Jobs</span>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-icon active"><mat-icon>play_circle</mat-icon></div>
          <div class="stat-info">
            <span class="stat-number">{{ dashboard.activeJobs }}</span>
            <span class="stat-label">Active (Legacy)</span>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-icon migrated"><mat-icon>check_circle</mat-icon></div>
          <div class="stat-info">
            <span class="stat-number">{{ dashboard.migratedJobs }}</span>
            <span class="stat-label">Fully Migrated</span>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-icon parallel"><mat-icon>compare_arrows</mat-icon></div>
          <div class="stat-info">
            <span class="stat-number">{{ dashboard.inParallelJobs }}</span>
            <span class="stat-label">Running in Parallel</span>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-icon decommissioned"><mat-icon>cancel</mat-icon></div>
          <div class="stat-info">
            <span class="stat-number">{{ dashboard.decommissionedJobs }}</span>
            <span class="stat-label">Decommissioned</span>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <div class="stat-icon remaining"><mat-icon>pending</mat-icon></div>
          <div class="stat-info">
            <span class="stat-number">{{ dashboard.remainingJobs }}</span>
            <span class="stat-label">Remaining</span>
          </div>
        </mat-card>
      </div>

      <h2>Jobs by Process Stage</h2>
      <div class="stage-grid">
        <mat-card *ngFor="let entry of stageEntries" class="stage-card">
          <div class="stage-bar" [style.width.%]="getStagePercent(entry[1])"></div>
          <div class="stage-content">
            <span class="stage-name">{{ entry[0] }}</span>
            <span class="stage-count">{{ entry[1] }}</span>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header h1 { margin: 0; color: #333; font-weight: 400; }
    .subtitle { color: #777; margin: 4px 0 24px; }
    h2 { color: #555; font-weight: 400; margin: 24px 0 12px; }
    .progress-section { margin-bottom: 24px; }
    .progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .progress-header h2 { margin: 0; }
    .progress-percent { font-size: 28px; font-weight: 600; color: #3f51b5; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .stat-card { display: flex; align-items: center; padding: 20px; }
    .stat-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; }
    .stat-icon mat-icon { color: #fff; font-size: 24px; }
    .stat-icon.total { background: #607d8b; }
    .stat-icon.active { background: #2196f3; }
    .stat-icon.migrated { background: #4caf50; }
    .stat-icon.parallel { background: #ff9800; }
    .stat-icon.decommissioned { background: #9e9e9e; }
    .stat-icon.remaining { background: #f44336; }
    .stat-number { font-size: 28px; font-weight: 600; display: block; color: #333; }
    .stat-label { font-size: 12px; color: #777; text-transform: uppercase; }
    .stage-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
    .stage-card { position: relative; overflow: hidden; padding: 16px; }
    .stage-bar { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(63, 81, 181, 0.08); }
    .stage-content { position: relative; display: flex; justify-content: space-between; align-items: center; }
    .stage-name { font-weight: 500; color: #333; }
    .stage-count { font-size: 20px; font-weight: 600; color: #3f51b5; }
  `]
})
export class MigrationDashboardComponent implements OnInit {
  dashboard: BatchDashboard | null = null;
  stageEntries: [string, number][] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getBatchDashboard().subscribe(d => {
      this.dashboard = d;
      this.stageEntries = Object.entries(d.jobsByStage);
    });
  }

  getStagePercent(count: number): number {
    if (!this.dashboard) return 0;
    const max = Math.max(...Object.values(this.dashboard.jobsByStage));
    return (count / max) * 100;
  }
}
