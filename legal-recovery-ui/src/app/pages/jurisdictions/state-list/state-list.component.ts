import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../../services/api.service';
import { State } from '../../../models/jurisdiction.model';

@Component({
  selector: 'app-state-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTableModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Jurisdiction Management</h1>
        <p class="subtitle">Manage states, counties, and courthouses across the jurisdiction hierarchy</p>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="states" class="full-width">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let state">
                <span class="state-code">{{ state.code }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>State Name</th>
              <td mat-cell *matCellDef="let state">{{ state.name }}</td>
            </ng-container>

            <ng-container matColumnDef="counties">
              <th mat-header-cell *matHeaderCellDef>Counties</th>
              <td mat-cell *matCellDef="let state">{{ state.countyCount }}</td>
            </ng-container>

            <ng-container matColumnDef="courthouses">
              <th mat-header-cell *matHeaderCellDef>Courthouses</th>
              <td mat-cell *matCellDef="let state">{{ state.courthouseCount }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let state">
                <mat-chip [class.active-chip]="state.isActive" [class.inactive-chip]="!state.isActive">
                  {{ state.isActive ? 'Active' : 'Inactive' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let state">
                <button mat-icon-button color="primary" [routerLink]="['/jurisdictions', state.id, 'hierarchy']"
                        matTooltip="View Hierarchy">
                  <mat-icon>account_tree</mat-icon>
                </button>
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
    .full-width { width: 100%; }
    .state-code { font-weight: 600; color: #3f51b5; background: #e8eaf6; padding: 4px 8px; border-radius: 4px; }
    .active-chip { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .inactive-chip { background: #fce4ec !important; color: #c62828 !important; }
  `]
})
export class StateListComponent implements OnInit {
  states: State[] = [];
  displayedColumns = ['code', 'name', 'counties', 'courthouses', 'status', 'actions'];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getStates().subscribe(states => this.states = states);
  }
}
