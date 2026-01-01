// All mock data is currently commented out per request.
// If you need to re-enable specific mock exports, remove the leading '//' from the relevant lines.

// export interface Pole {
//   pole_id: string;
//   latitude: number;
//   longitude: number;
//   status: 'ON' | 'OFF';
//   cluster_id: string;
//   battery_percentage: number;
//   communication_status: 'ONLINE' | 'OFFLINE';
// }

// export interface TelemetryData {
//   data_quality: any;
//   data_source: any;
//   signal_strength: any;
//   light_intensity: any;
//   battery_current: any;
//   battery_voltage: any;
//   timestamp: string;
//   solar_voltage: number;
//   energy_generated: number;
//   energy_consumed: number;
//   battery_percentage: number;
//   load_current: number;
// }

// export interface Alert {
//   remarks?: string;
//   action_taken?: string;
//   technician_id?: string;
//   alert_status: 'ACTIVE' | 'RESOLVED' | 'PENDING';
//   alert_type: string;
//   id: string;
//   pole_id: string;
//   message: string;
//   severity: 'critical' | 'warning' | 'info';
//   timestamp: string;
// }

// export interface Pole {
//   pole_id: string;
//   latitude: number;
//   longitude: number;
//   status: 'ON' | 'OFF';
//   cluster_id: string;
//   battery_percentage?: number;
//   communication_status?: 'ONLINE' | 'OFFLINE';
// }

// export const mockPoles: Pole[] = [
//   {
//     pole_id: 'A01',
//     latitude: 19.076,
//     longitude: 72.8777,
//     status: 'ON',
//     cluster_id: 'Mumbai_1',
//     battery_percentage: 85,
//     communication_status: 'ONLINE',
//   },
//   {
//     pole_id: 'A02',
//     latitude: 18.5204,
//     longitude: 73.8567,
//     status: 'OFF',
//     cluster_id: 'Pune_1',
//     battery_percentage: 15,
//     communication_status: 'OFFLINE',
//   },
//   {
//     pole_id: 'A03',
//     latitude: 28.7041,
//     longitude: 77.1025,
//     status: 'ON',
//     cluster_id: 'Delhi_1',
//     battery_percentage: 92,
//     communication_status: 'ONLINE',
//   },
// ];

// export interface TelemetryData {
//   timestamp: string;
//   solar_voltage?: number;
//   energy_generated?: number;
//   energy_consumed?: number;
//   battery_percentage?: number;
//   load_current?: number;
// }

// export const generateTelemetryData = (): TelemetryData[] => {
//   const data: TelemetryData[] = [];
//   const now = new Date();
//   for (let i = 23; i >= 0; i--) {
//     const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
//     data.push({
//       timestamp: timestamp.toISOString(),
//       solar_voltage: 12 + Math.random() * 2,
//       energy_generated: 50 + Math.random() * 100,
//       energy_consumed: 30 + Math.random() * 80,
//       battery_percentage: 70 + Math.random() * 30,
//       load_current: 2 + Math.random() * 3,
//     });
//   }
//   return data;
// };

// export const mockAlerts: Alert[] = [
//   {
//     id: '1',
//     pole_id: 'A05',
//     message: 'Low battery detected',
//     severity: 'warning',
//     alert_status: 'ACTIVE',
//     alert_type: 'Battery',
//     timestamp: new Date().toISOString(),
//   },
//   {
//     id: '2',
//     pole_id: 'A02',
//     message: 'Communication failure',
//     severity: 'critical',
//     alert_status: 'ACTIVE',
//     alert_type: 'No Communication',
//     timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
//   },
//   {
//     id: '3',
//     pole_id: 'A06',
//     message: 'Pole offline',
//     severity: 'critical',
//     alert_status: 'RESOLVED',
//     alert_type: 'Manual Switch',
//     timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
//   },
// ];
