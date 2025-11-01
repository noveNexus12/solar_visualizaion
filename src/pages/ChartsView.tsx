import { useEffect, useState } from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/services/api.service";

// -------------------- Types --------------------
interface Pole {
  pole_id: string;
  cluster_id: string;
}

interface TelemetryData {
  pole_id: string;
  status?: "ON" | "OFF";
  solar_voltage?: number;
  battery_voltage?: number;
  energy_generated?: number;
  energy_consumed?: number;
  battery_percentage?: number;
  load_current?: number;
  light_intensity?: number;
  signal_strength?: number;
  timestamp: string;
}

// -------------------- Component --------------------
export default function ChartsView() {
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [poles, setPoles] = useState<Pole[]>([]);
  const [selectedPole, setSelectedPole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch poles
  useEffect(() => {
    loadPoles();
  }, []);

  // Fetch telemetry data periodically
  useEffect(() => {
    if (!selectedPole) return;
    loadTelemetryData(selectedPole);
    const interval = setInterval(() => loadTelemetryData(selectedPole), 60000); // every 1 min
    return () => clearInterval(interval);
  }, [selectedPole]);

  const loadPoles = async () => {
    try {
      const data = await apiService.getPoles();
      setPoles(data || []);
      if (data?.length > 0) setSelectedPole(data[0].pole_id);
    } catch (error) {
      console.error("Error loading poles:", error);
    }
  };

  const loadTelemetryData = async (poleId: string) => {
    try {
      setLoading(true);
      const data = await apiService.getTelemetryData({ pole_id: poleId });
      setTelemetryData(data || []);
    } catch (error) {
      console.error("Error loading telemetry data:", error);
    } finally {
      setLoading(false);
    }
  };

  const latest = telemetryData.at(-1);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:00`;
  };

  // Chart-friendly data
  const chartData = telemetryData.map((d) => ({
    time: formatTime(d.timestamp),
    voltage: parseFloat(d.solar_voltage?.toFixed(2) || "0"),
    batteryVoltage: parseFloat(d.battery_voltage?.toFixed(2) || "0"),
    generated: parseFloat(d.energy_generated?.toFixed(2) || "0"),
    consumed: parseFloat(d.energy_consumed?.toFixed(2) || "0"),
    battery: parseFloat(d.battery_percentage?.toFixed(1) || "0"),
    current: parseFloat(d.load_current?.toFixed(2) || "0"),
    light: parseFloat(d.light_intensity?.toFixed(2) || "0"),
    signal: d.signal_strength ?? 0,
  }));

  // -------------------- UI --------------------
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Solar Pole Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor ON/OFF status, voltage, and energy metrics of each pole.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          (Auto-refreshes every 1 minute; major updates at <b>6:45 AM</b> & <b>6:45 PM</b>)
        </p>
      </div>

      {/* Pole Selector */}
      <div className="mb-4">
        <select
          value={selectedPole}
          onChange={(e) => setSelectedPole(e.target.value)}
          className="border border-border bg-background rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary transition-all"
        >
          {poles.length > 0 ? (
            poles.map((pole) => (
              <option key={pole.pole_id} value={pole.pole_id}>
                {pole.pole_id} ({pole.cluster_id})
              </option>
            ))
          ) : (
            <option disabled>No poles found</option>
          )}
        </select>
      </div>

      {/* Status & Charts */}
      {loading ? (
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          Loading data...
        </div>
      ) : !latest ? (
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          No telemetry data available yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Status Card */}
          <Card className="border-border hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center h-96">
            <CardHeader>
              <CardTitle>{selectedPole} — Current Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6">
              <div
                className={`w-40 h-40 rounded-full transition-all duration-700 ${
                  latest.status === "ON"
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-700 animate-pulse"
                }`}
              ></div>

              <p
                className={`text-xl font-semibold ${
                  latest.status === "ON" ? "text-green-600" : "text-red-700"
                }`}
              >
                {latest.status === "ON"
                  ? "Pole is ON (Active)"
                  : "Pole is OFF (Inactive)"}
              </p>

              <p className="text-sm text-muted-foreground">
                Signal Strength: {latest.signal_strength ?? 0} dBm
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(latest.timestamp).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Battery Level Gauge */}
          <Card className="border-border hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Current Battery Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={
                        (latest.battery_percentage ?? 0) > 50
                          ? "hsl(var(--success))"
                          : (latest.battery_percentage ?? 0) > 20
                          ? "hsl(var(--warning))"
                          : "hsl(var(--destructive))"
                      }
                      strokeWidth="8"
                      strokeDasharray={`${(latest.battery_percentage || 0) * 2.51} 251`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-foreground">
                      {latest.battery_percentage?.toFixed(0) || 0}%
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">Battery</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voltage Line Chart */}
          <Card className="md:col-span-2 border-border hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Solar & Battery Voltage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="voltage" stroke="hsl(var(--primary))" name="Solar Voltage (V)" />
                  <Line type="monotone" dataKey="batteryVoltage" stroke="hsl(var(--success))" name="Battery Voltage (V)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Energy Generated vs Consumed */}
          <Card className="md:col-span-2 border-border hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Energy Generated vs Consumed</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="generated" fill="hsl(var(--success))" name="Generated (Wh)" />
                  <Bar dataKey="consumed" fill="hsl(var(--warning))" name="Consumed (Wh)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Current & Light Intensity */}
          <Card className="md:col-span-2 border-border hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Load Current, Light & Signal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="current" stroke="hsl(var(--accent))" fillOpacity={0.3} name="Load Current (A)" />
                  <Area type="monotone" dataKey="light" stroke="hsl(var(--warning))" fillOpacity={0.3} name="Light Intensity (lux)" />
                  <Area type="monotone" dataKey="signal" stroke="hsl(var(--destructive))" fillOpacity={0.3} name="Signal Strength" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
