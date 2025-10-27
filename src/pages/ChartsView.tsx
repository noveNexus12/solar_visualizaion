import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/services/api.service';
import { TelemetryData, Pole } from '@/lib/mockData';
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

export default function ChartsView() {
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [poles, setPoles] = useState<Pole[]>([]);
  const [selectedPole, setSelectedPole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load available poles on mount
  useEffect(() => {
    loadPoles();
  }, []);

  // Load telemetry data for selected pole and auto-refresh hourly
  useEffect(() => {
    if (!selectedPole) return;
    loadTelemetryData(selectedPole);
    const interval = setInterval(() => loadTelemetryData(selectedPole), 3600000); // every 1 hour
    return () => clearInterval(interval);
  }, [selectedPole]);

  const loadPoles = async () => {
    try {
      const data = await apiService.getPoles();
      setPoles(data || []);
      if (data?.length > 0) setSelectedPole(data[0].pole_id);
    } catch (error) {
      console.error('Error loading poles:', error);
    }
  };

  const loadTelemetryData = async (poleId: string) => {
    try {
      setLoading(true);
      const data = await apiService.getTelemetryData({ pole_id: poleId });

      // 🌅🌇 Filter to only include data around 6–7 AM or 6–7 PM
      const filtered = (data || []).filter((d: TelemetryData) => {
        const hour = new Date(d.timestamp).getHours();
        return (hour >= 6 && hour < 7) || (hour >= 18 && hour < 19);
      });
      
      setTelemetryData(data || []);
    } catch (error) {
      console.error('Error loading telemetry data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:00`;
  };

  // Prepare data for charts
  const chartData = telemetryData.map((data) => ({
    time: formatTime(data.timestamp),
    voltage: parseFloat(data.solar_voltage?.toFixed(2) || '0'),
    batteryVoltage: parseFloat(data.battery_voltage?.toFixed(2) || '0'),
    generated: parseFloat(data.energy_generated?.toFixed(2) || '0'),
    consumed: parseFloat(data.energy_consumed?.toFixed(2) || '0'),
    battery: parseFloat(data.battery_percentage?.toFixed(1) || '0'),
    current: parseFloat(data.load_current?.toFixed(2) || '0'),
    light: parseFloat(data.light_intensity?.toFixed(2) || '0'),
    signal: data.signal_strength ?? 0,
  }));

  const currentTelemetry = telemetryData.at(-1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Telemetry Charts</h1>
        <p className="text-muted-foreground mt-1">
          Select a pole to view its performance metrics
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

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          Loading charts...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Solar & Battery Voltage Line Chart */}
          <Card className="border-border md:col-span-2 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Solar & Battery Voltage (Last 24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="voltage" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Solar Voltage (V)" />
                  <Line type="monotone" dataKey="batteryVoltage" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="Battery Voltage (V)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Energy Generated vs Consumed */}
          <Card className="border-border md:col-span-2 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Energy Generated vs Consumed</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="generated" fill="hsl(var(--success))" name="Generated (Wh)" />
                  <Bar dataKey="consumed" fill="hsl(var(--warning))" name="Consumed (Wh)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Battery Gauge */}
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
                        (currentTelemetry?.battery_percentage ?? 0) > 50
                          ? 'hsl(var(--success))'
                          : (currentTelemetry?.battery_percentage ?? 0) > 20
                          ? 'hsl(var(--warning))'
                          : 'hsl(var(--destructive))'
                      }
                      strokeWidth="8"
                      strokeDasharray={`${(currentTelemetry?.battery_percentage || 0) * 2.51} 251`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-foreground">
                      {currentTelemetry?.battery_percentage?.toFixed(0) || 0}%
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">Battery</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Flow Area Chart */}
          <Card className="border-border hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Current Flow (Load vs Battery)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="current" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} name="Load Current (A)" />
                  <Area type="monotone" dataKey="battery" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} name="Battery (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Light Intensity & Signal Strength */}
          <Card className="border-border md:col-span-2 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Light Intensity & Signal Strength</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="light" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} name="Light Intensity (lux)" />
                  <Line type="monotone" dataKey="signal" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Signal Strength" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
