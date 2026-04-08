import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const getTerritories = () => api.get('/territories');
export const getMarkets = (territoryId) => api.get(`/markets?territoryId=${territoryId}`);
export const getTechnicians = (marketId) => api.get(`/technicians${marketId ? `?marketId=${marketId}` : ''}`);
export const getJobs = (marketId) => api.get(`/jobs${marketId ? `?marketId=${marketId}` : ''}`);

export const getGanttData = (territoryId, marketIds, date) => {
  const params = new URLSearchParams();
  if (territoryId) params.append('territoryId', territoryId);
  if (marketIds && marketIds.length > 0) {
    marketIds.forEach(id => params.append('marketIds', id));
  }
  params.append('date', date);
  return api.get(`/gantt?${params.toString()}`);
};

export const updateAssignment = (id, data) => api.put(`/assignments/${id}`, data);
export const createAssignment = (data) => api.post('/assignments', data);
export const deleteAssignment = (id) => api.delete(`/assignments/${id}`);

export const createTechnician = (data) => api.post('/technicians', data);
export const updateTechnician = (id, data) => api.put(`/technicians/${id}`, data);
export const deleteTechnician = (id) => api.delete(`/technicians/${id}`);

export const createJob = (data) => api.post('/jobs', data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);

export default api;
