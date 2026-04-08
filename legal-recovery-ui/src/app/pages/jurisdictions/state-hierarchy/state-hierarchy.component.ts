import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApiService } from '../../../services/api.service';
import { StateHierarchy } from '../../../models/jurisdiction.model';

@Component({
  selector: 'app-state-hierarchy',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatExpansionModule],
  template: `
    <div class="page-container" *ngIf="hierarchy">
      <div class="page-header">
        <button mat-icon-button routerLink="/jurisdictions"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h1>{{ hierarchy.stateName }} ({{ hierarchy.stateCode }})</h1>
          <p class="subtitle">Jurisdiction hierarchy with rule inheritance</p>
        </div>
      </div>

      <div class="state-rules">
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar class="level-icon state-level">public</mat-icon>
            <mat-card-title>State-Level Rules</mat-card-title>
            <mat-card-subtitle>Default rules inherited by all counties and courthouses</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="rules-grid">
              <div class="rule">
                <span class="rule-label">Statute of Limitations</span>
                <span class="rule-value">{{ hierarchy.statuteOfLimitationsMonths }} months</span>
              </div>
              <div class="rule">
                <span class="rule-label">Minimum Balance</span>
                <span class="rule-value">\${{ hierarchy.defaultMinimumBalance | number }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <h2>Counties ({{ hierarchy.counties.length }})</h2>
      <mat-accordion>
        <mat-expansion-panel *ngFor="let county of hierarchy.counties">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon class="county-icon">location_city</mat-icon>
              {{ county.name }}
            </mat-panel-title>
            <mat-panel-description>
              FIPS: {{ county.fipsCode }} | {{ county.courthouses.length }} courthouse(s)
              <mat-chip *ngIf="county.minimumBalanceOverride" class="override-chip">Override</mat-chip>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="county-rules" *ngIf="county.statuteOfLimitationsMonthsOverride || county.minimumBalanceOverride">
            <h4>County Overrides</h4>
            <div class="rules-grid">
              <div class="rule" *ngIf="county.statuteOfLimitationsMonthsOverride">
                <span class="rule-label">SOL Override</span>
                <span class="rule-value override">{{ county.statuteOfLimitationsMonthsOverride }} months</span>
              </div>
              <div class="rule" *ngIf="county.minimumBalanceOverride">
                <span class="rule-label">Min Balance Override</span>
                <span class="rule-value override">\${{ county.minimumBalanceOverride | number }}</span>
              </div>
            </div>
          </div>

          <h4>Courthouses</h4>
          <div class="courthouse-cards">
            <mat-card *ngFor="let ch of county.courthouses" class="courthouse-card">
              <mat-card-header>
                <mat-icon mat-card-avatar class="level-icon courthouse-level">account_balance</mat-icon>
                <mat-card-title>{{ ch.name }}</mat-card-title>
                <mat-card-subtitle>{{ ch.courthouseCode }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="rules-grid">
                  <div class="rule">
                    <span class="rule-label">E-Filing</span>
                    <mat-chip [class.efiling-required]="ch.eFilingStatus === 'Required'"
                              [class.efiling-available]="ch.eFilingStatus === 'Available'"
                              [class.efiling-none]="ch.eFilingStatus === 'NotAvailable'">
                      {{ ch.eFilingStatus }}
                    </mat-chip>
                  </div>
                  <div class="rule" *ngIf="ch.filingFeeOverride">
                    <span class="rule-label">Filing Fee</span>
                    <span class="rule-value">\${{ ch.filingFeeOverride | number }}</span>
                  </div>
                  <div class="rule">
                    <span class="rule-label">Effective SOL</span>
                    <span class="rule-value">{{ ch.effectiveStatuteOfLimitationsMonths }} months</span>
                  </div>
                  <div class="rule">
                    <span class="rule-label">Effective Min Balance</span>
                    <span class="rule-value">\${{ ch.effectiveMinimumBalance | number }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .page-header h1 { margin: 0; color: #333; font-weight: 400; }
    .subtitle { color: #777; margin: 0; }
    h2 { color: #555; font-weight: 400; margin: 24px 0 12px; }
    h4 { color: #555; margin: 16px 0 8px; font-weight: 500; }
    .rules-grid { display: flex; flex-wrap: wrap; gap: 24px; margin-top: 12px; }
    .rule { display: flex; flex-direction: column; }
    .rule-label { font-size: 12px; color: #999; text-transform: uppercase; }
    .rule-value { font-size: 18px; font-weight: 500; color: #333; }
    .rule-value.override { color: #ff9800; }
    .level-icon { font-size: 28px; width: 40px; height: 40px; line-height: 40px; text-align: center; border-radius: 50%; color: #fff; }
    .state-level { background: #3f51b5; }
    .courthouse-level { background: #795548; }
    .county-icon { color: #607d8b; margin-right: 8px; }
    .override-chip { background: #fff3e0 !important; color: #e65100 !important; font-size: 11px; margin-left: 8px; }
    .courthouse-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
    .courthouse-card { }
    .efiling-required { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .efiling-available { background: #e3f2fd !important; color: #1565c0 !important; }
    .efiling-none { background: #fce4ec !important; color: #c62828 !important; }
    .county-rules { background: #fff8e1; padding: 12px; border-radius: 8px; margin-bottom: 12px; }
  `]
})
export class StateHierarchyComponent implements OnInit {
  hierarchy: StateHierarchy | null = null;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const stateId = this.route.snapshot.paramMap.get('stateId');
    if (stateId) {
      this.api.getStateHierarchy(stateId).subscribe(h => this.hierarchy = h);
    }
  }
}
