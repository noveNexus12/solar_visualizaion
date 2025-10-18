const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiService = {
  // Get all poles
  getPoles: async () => {
    const response = await fetch(`${API_BASE_URL}/poles`);
    if (!response.ok) throw new Error('Failed to fetch poles');
    return await response.json();
  },

  // Get specific pole details
  getPoleDetails: async (poleId: string) => {
    const response = await fetch(`${API_BASE_URL}/poles/${poleId}`);
    if (!response.ok) throw new Error('Failed to fetch pole details');
    return await response.json();
  },

  // Get telemetry data
  getTelemetryData: async (p0: { pole_id: string; }) => {
    const response = await fetch(`${API_BASE_URL}/telemetry`);
    if (!response.ok) throw new Error('Failed to fetch telemetry data');
    return await response.json();
  },

  // Get alerts
  getAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return await response.json();
  },

  // Get dashboard stats (optional – backend can compute this)
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  },
};
