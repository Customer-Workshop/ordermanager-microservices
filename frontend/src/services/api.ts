import axios from 'axios';
import type {
  DashboardData,
  Location,
  PracticeUnit,
  Role,
  Candidate,
  StaffingRequest,
  RoleRubric,
  SLADefinition,
} from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Dashboard
export const fetchDashboard = () => api.get<DashboardData>('/dashboard/');

// Locations
export const fetchLocations = () => api.get<Location[]>('/locations/');
export const createLocation = (data: Partial<Location>) => api.post<Location>('/locations/', data);

// Practice Units
export const fetchPracticeUnits = () => api.get<PracticeUnit[]>('/practice-units/');
export const createPracticeUnit = (data: Partial<PracticeUnit>) => api.post<PracticeUnit>('/practice-units/', data);

// Roles
export const fetchRoles = (params?: { category?: string; practice_unit_id?: number }) =>
  api.get<Role[]>('/roles/', { params });
export const createRole = (data: Partial<Role>) => api.post<Role>('/roles/', data);

// Candidates
export const fetchCandidates = (params?: { status_filter?: string; location_id?: number }) =>
  api.get<Candidate[]>('/candidates/', { params });
export const createCandidate = (data: Partial<Candidate>) => api.post<Candidate>('/candidates/', data);

// Staffing Requests
export const fetchStaffingRequests = (params?: { status_filter?: string; priority?: string }) =>
  api.get<StaffingRequest[]>('/staffing-requests/', { params });
export const createStaffingRequest = (data: Partial<StaffingRequest>) =>
  api.post<StaffingRequest>('/staffing-requests/', data);

// Rubrics
export const fetchRubrics = (params?: { role_id?: number }) =>
  api.get<RoleRubric[]>('/rubrics/', { params });
export const createRubric = (data: Partial<RoleRubric>) => api.post<RoleRubric>('/rubrics/', data);
export const uploadRubricHtml = (rubricId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/rubrics/${rubricId}/upload-html`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getRubricHtml = (rubricId: number) => api.get<string>(`/rubrics/${rubricId}/html`);

// SLA
export const fetchSLADefinitions = () => api.get<SLADefinition[]>('/sla/definitions');
export const uploadSLAAttachment = (slaId: number, file: File, description?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (description) formData.append('description', description);
  return api.post(`/sla/definitions/${slaId}/upload-attachment`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// AI / Semantic Search
export const semanticSearch = (query: string) =>
  api.post('/ai/semantic-search', { query });

export default api;
