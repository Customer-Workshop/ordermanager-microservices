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
          <div class="brand-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
          <span class="brand-text" *ngIf="!sidebarCollapsed">OrderManager</span>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
            <span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/orders" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></span>
            <span class="nav-label">Orders</span>
          </a>
          <a routerLink="/products" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>
            <span class="nav-label">Products</span>
          </a>
          <a routerLink="/customers" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
            <span class="nav-label">Customers</span>
          </a>
          <a routerLink="/inventory" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg></span>
            <span class="nav-label">Inventory</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-footer-info">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
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
