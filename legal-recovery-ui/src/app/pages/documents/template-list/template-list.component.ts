import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../services/api.service';
import { DocumentTemplate } from '../../../models/document.model';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Document Templates</h1>
        <p class="subtitle">Manage 44,000+ document templates with jurisdiction tagging and versioning</p>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="templates" class="full-width">
            <ng-container matColumnDef="templateCode">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let t"><span class="code-badge">{{ t.templateCode }}</span></td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let t">{{ t.name }}</td>
            </ng-container>
            <ng-container matColumnDef="documentType">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let t">{{ t.documentType }}</td>
            </ng-container>
            <ng-container matColumnDef="productType">
              <th mat-header-cell *matHeaderCellDef>Product</th>
              <td mat-cell *matCellDef="let t">{{ t.productType }}</td>
            </ng-container>
            <ng-container matColumnDef="format">
              <th mat-header-cell *matHeaderCellDef>Format</th>
              <td mat-cell *matCellDef="let t">
                <mat-chip class="format-chip">{{ t.format }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="version">
              <th mat-header-cell *matHeaderCellDef>Version</th>
              <td mat-cell *matCellDef="let t">v{{ t.versionNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let t">
                <mat-chip [class.active-chip]="t.status === 'Active'" [class.inactive-chip]="t.status !== 'Active'">
                  {{ t.status }}
                </mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="jurisdiction">
              <th mat-header-cell *matHeaderCellDef>Jurisdiction</th>
              <td mat-cell *matCellDef="let t">{{ t.stateName || 'All' }}</td>
            </ng-container>
            <ng-container matColumnDef="usageCount">
              <th mat-header-cell *matHeaderCellDef>Usage</th>
              <td mat-cell *matCellDef="let t">{{ t.usageCount | number }}</td>
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
    .code-badge { font-family: monospace; font-weight: 600; color: #3f51b5; background: #e8eaf6; padding: 2px 6px; border-radius: 4px; }
    .format-chip { font-size: 11px; }
    .active-chip { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .inactive-chip { background: #fce4ec !important; color: #c62828 !important; }
  `]
})
export class TemplateListComponent implements OnInit {
  templates: DocumentTemplate[] = [];
  displayedColumns = ['templateCode', 'name', 'documentType', 'productType', 'format', 'version', 'status', 'jurisdiction', 'usageCount'];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getTemplates().subscribe(t => this.templates = t);
  }
}
