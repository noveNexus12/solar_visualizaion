import { mockPoles, generateTelemetryData, mockAlerts, Pole, TelemetryData, Alert } from '@/lib/mockData';

// Base URL for future API integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiService = {
  // Get all poles
  getPoles: async (): Promise<Pole[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPoles;
  },

  // Get specific pole details
  getPoleDetails: async (poleId: string): Promise<Pole | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPoles.find(pole => pole.pole_id === poleId);
  },

  // Get telemetry data
  getTelemetryData: async (): Promise<TelemetryData[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateTelemetryData();
  },

  // Get alerts
  getAlerts: async (): Promise<Alert[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockAlerts;
  },

  // Get dashboard stats
  getStats: async () => {
    const poles = await apiService.getPoles();
    return {
      total: poles.length,
      active: poles.filter(p => p.status === 'ON').length,
      inactive: poles.filter(p => p.status === 'OFF').length,
      alerts: mockAlerts.length,
    };
  },
};
