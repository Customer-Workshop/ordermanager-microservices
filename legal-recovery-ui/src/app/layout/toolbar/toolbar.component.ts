import { Component, EventEmitter, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="toggleSidenav.emit()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="logo">Legal Recovery Platform</span>
      <span class="spacer"></span>
      <span class="env-badge">DEV</span>
    </mat-toolbar>
  `,
  styles: [`
    .logo { margin-left: 8px; font-size: 18px; font-weight: 500; }
    .spacer { flex: 1; }
    .env-badge {
      background: #ff9800; color: #fff; padding: 2px 10px;
      border-radius: 12px; font-size: 12px; font-weight: 600;
    }
  `]
})
export class ToolbarComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
}
