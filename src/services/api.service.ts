const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://solarlightmonitoring.technnovxp.com/api";

export const apiService = {
  // Get all poles
  getPoles: async () => {
    const response = await fetch(`${API_BASE_URL}/poles`);
    if (!response.ok) return [];
    return await response.json();
  },

  // Get specific pole details
  getPoleDetails: async (poleId: string) => {
    const response = await fetch(`${API_BASE_URL}/poles/${poleId}`);
    if (!response.ok) throw new Error("Failed to fetch pole details");
    return await response.json();
  },

  // Get telemetry data
  getTelemetryData: async ({ pole_id }: { pole_id: string }) => {
    const response = await fetch(
      `${API_BASE_URL}/telemetry?pole_id=${pole_id}`
    );
    if (!response.ok) return [];
    return await response.json();
  },

  // Get alerts
  getAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    if (!response.ok) return [];
    return await response.json();
  },

  // Dashboard stats
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok)
      return { total: 0, active: 0, inactive: 0, alerts: 0 };
    return await response.json();
  },

  // Get current user (Correct Endpoint)
  getCurrentUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const res = await fetch(`${API_BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return null;
    return await res.json();
  },

  // Logout
  logout: async () => {
    localStorage.removeItem("token");
  },
};
