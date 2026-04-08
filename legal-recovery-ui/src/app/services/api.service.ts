import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { State, StateHierarchy } from '../models/jurisdiction.model';
import { Account, CreateAccountRequest } from '../models/account.model';
import { Attorney, EligibleAttorney } from '../models/attorney.model';
import { DocumentTemplate, RationalizationReport } from '../models/document.model';
import { BatchDashboard, MigrationDashboard } from '../models/batch-migration.model';
import { IntegrationDashboard, IntegrationPartner } from '../models/integration.model';
import { Garnishment } from '../models/garnishment.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  // Jurisdictions
  getStates(): Observable<State[]> {
    return this.http.get<State[]>(`${this.baseUrl}/Jurisdictions/states`);
  }

  getStateHierarchy(stateId: string): Observable<StateHierarchy> {
    return this.http.get<StateHierarchy>(`${this.baseUrl}/Jurisdictions/states/${stateId}/hierarchy`);
  }

  createState(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Jurisdictions/states`, data);
  }

  // Accounts
  getAccount(accountId: string): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/Accounts/${accountId}`);
  }

  createAccount(data: CreateAccountRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/Accounts`, data);
  }

  evaluateSelection(accountId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/Accounts/${accountId}/evaluate-selection`, {});
  }

  // Attorneys
  createAttorney(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Attorneys`, data);
  }

  assignAttorney(accountId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/Attorneys/assign/${accountId}`, {});
  }

  getEligibleAttorneys(courthouseId: string): Observable<EligibleAttorney[]> {
    return this.http.get<EligibleAttorney[]>(`${this.baseUrl}/Attorneys/eligible/${courthouseId}`);
  }

  // Documents
  getTemplates(): Observable<DocumentTemplate[]> {
    return this.http.get<DocumentTemplate[]>(`${this.baseUrl}/Documents/templates`);
  }

  createTemplate(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Documents/templates`, data);
  }

  getRationalizationReport(): Observable<RationalizationReport> {
    return this.http.get<RationalizationReport>(`${this.baseUrl}/Documents/rationalization-report`);
  }

  // Batch Migration
  getBatchDashboard(): Observable<BatchDashboard> {
    return this.http.get<BatchDashboard>(`${this.baseUrl}/BatchMigration/dashboard`);
  }

  getMigrationDashboard(): Observable<MigrationDashboard> {
    return this.http.get<MigrationDashboard>(`${this.baseUrl}/BatchMigration/migration-dashboard`);
  }

  updateJobStatus(jobId: string, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/BatchMigration/jobs/${jobId}/status`, { status });
  }

  reconcileJob(jobId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/BatchMigration/jobs/${jobId}/reconcile`, {});
  }

  // Integrations
  getIntegrationDashboard(): Observable<IntegrationDashboard> {
    return this.http.get<IntegrationDashboard>(`${this.baseUrl}/Integrations/dashboard`);
  }

  createPartner(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Integrations/partners`, data);
  }

  setDualMode(partnerId: string, enabled: boolean): Observable<any> {
    return this.http.put(`${this.baseUrl}/Integrations/partners/${partnerId}/dual-mode`, { enabled });
  }

  // Filing
  fileSuit(accountId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/Filing/${accountId}`, {});
  }

  getEFilingMatrix(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Filing/e-filing-matrix`);
  }

  // Garnishments
  createGarnishment(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Garnishments`, data);
  }

  getAccountGarnishments(accountId: string): Observable<Garnishment[]> {
    return this.http.get<Garnishment[]>(`${this.baseUrl}/Garnishments/account/${accountId}`);
  }
}
