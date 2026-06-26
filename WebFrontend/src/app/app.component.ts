import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-brand">
          <div class="brand-icon">&#128230;</div>
          <span class="brand-text" *ngIf="!sidebarCollapsed">OrderManager</span>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">&#127968;</span>
            <span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/orders" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">&#128203;</span>
            <span class="nav-label">Orders</span>
          </a>
          <a routerLink="/products" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">&#128722;</span>
            <span class="nav-label">Products</span>
          </a>
          <a routerLink="/customers" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">&#128101;</span>
            <span class="nav-label">Customers</span>
          </a>
          <a routerLink="/inventory" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">&#128230;</span>
            <span class="nav-label">Inventory</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-footer-info">
            <span class="nav-icon">&#9881;&#65039;</span>
            <span class="nav-label">v1.0 Microservices</span>
          </div>
        </div>
      </aside>
      <div class="main-area">
        <header class="top-bar">
          <button class="menu-toggle" (click)="sidebarCollapsed = !sidebarCollapsed">&#9776;</button>
          <div class="top-bar-right">
            <span class="env-badge">Development</span>
            <div class="avatar">OM</div>
          </div>
        </header>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: var(--sidebar-width); background: var(--gray-900); color: white; display: flex; flex-direction: column; flex-shrink: 0; transition: width 0.2s ease; overflow: hidden; }
    .sidebar.collapsed { width: 64px; }
    .sidebar-brand { display: flex; align-items: center; gap: 12px; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .brand-icon { font-size: 24px; flex-shrink: 0; }
    .brand-text { font-size: 18px; font-weight: 700; white-space: nowrap; }
    .sidebar-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 6px; color: var(--gray-400); transition: all 0.15s; white-space: nowrap; }
    .nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
    .nav-item.active { background: var(--primary); color: white; }
    .nav-icon { font-size: 18px; flex-shrink: 0; width: 24px; text-align: center; }
    .nav-label { font-size: 14px; font-weight: 500; }
    .sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.08); }
    .sidebar-footer-info { display: flex; align-items: center; gap: 8px; color: var(--gray-500); font-size: 12px; }
    .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .top-bar { height: var(--header-height); background: white; border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; }
    .menu-toggle { background: none; border: 1px solid var(--gray-200); border-radius: 6px; padding: 6px 10px; cursor: pointer; font-size: 18px; color: var(--gray-600); transition: all 0.15s; }
    .menu-toggle:hover { background: var(--gray-50); border-color: var(--gray-300); }
    .top-bar-right { display: flex; align-items: center; gap: 16px; }
    .env-badge { padding: 4px 12px; background: var(--success-light); color: var(--success); border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .avatar { width: 36px; height: 36px; border-radius: 9999px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; }
    .main-content { flex: 1; overflow-y: auto; background: var(--gray-50); }
    .collapsed .nav-label, .collapsed .brand-text, .collapsed .sidebar-footer-info .nav-label { display: none; }
  `]
})
export class AppComponent {
  title = 'OrderManager';
  sidebarCollapsed = false;
}
