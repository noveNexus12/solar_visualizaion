export interface Pole {
  pole_id: string;
  latitude: number;
  longitude: number;
  status: 'ON' | 'OFF';
  cluster_id: string;
  battery_percentage: number;
  communication_status: 'ONLINE' | 'OFFLINE';
}

export interface TelemetryData {
  data_quality: any;
  data_source: any;
  signal_strength: any;
  light_intensity: any;
  battery_current: any;
  battery_voltage: any;
  timestamp: string;
  solar_voltage: number;
  energy_generated: number;
  energy_consumed: number;
  battery_percentage: number;
  load_current: number;
}

export interface Alert {
  remarks: any;
  action_taken: any;
  technician_id: any;
  alert_status: any;
  alert_type: any;
  id: string;
  pole_id: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
}

export const mockPoles: Pole[] = [
  {
    pole_id: 'A01',
    latitude: 19.076,
    longitude: 72.8777,
    status: 'ON',
    cluster_id: 'Mumbai_1',
    battery_percentage: 85,
    communication_status: 'ONLINE',
  },
  {
    pole_id: 'A02',
    latitude: 18.5204,
    longitude: 73.8567,
    status: 'OFF',
    cluster_id: 'Pune_1',
    battery_percentage: 15,
    communication_status: 'OFFLINE',
  },
  {
    pole_id: 'A03',
    latitude: 28.7041,
    longitude: 77.1025,
    status: 'ON',
    cluster_id: 'Delhi_1',
    battery_percentage: 92,
    communication_status: 'ONLINE',
  },
  {
    pole_id: 'A04',
    latitude: 12.9716,
    longitude: 77.5946,
    status: 'ON',
    cluster_id: 'Bangalore_1',
    battery_percentage: 78,
    communication_status: 'ONLINE',
  },
  {
    pole_id: 'A05',
    latitude: 22.5726,
    longitude: 88.3639,
    status: 'ON',
    cluster_id: 'Kolkata_1',
    battery_percentage: 25,
    communication_status: 'ONLINE',
  },
  {
    pole_id: 'A06',
    latitude: 13.0827,
    longitude: 80.2707,
    status: 'OFF',
    cluster_id: 'Chennai_1',
    battery_percentage: 10,
    communication_status: 'OFFLINE',
  },
];

export const generateTelemetryData = (): TelemetryData[] => {
  const data: TelemetryData[] = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      solar_voltage: 12 + Math.random() * 2,
      energy_generated: 50 + Math.random() * 100,
      energy_consumed: 30 + Math.random() * 80,
      battery_percentage: 70 + Math.random() * 30,
      load_current: 2 + Math.random() * 3,
    });
  }
  
  return data;
};

export const mockAlerts: Alert[] = [
  {
    id: '1',
    pole_id: 'A05',
    message: 'Low battery detected',
    severity: 'warning',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    pole_id: 'A02',
    message: 'Communication failure',
    severity: 'critical',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    pole_id: 'A06',
    message: 'Pole offline',
    severity: 'critical',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];
