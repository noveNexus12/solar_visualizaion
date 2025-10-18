import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/services/api.service';
import { TelemetryData } from '@/lib/mockData';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ChartsView() {
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTelemetryData();
    const interval = setInterval(loadTelemetryData, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadTelemetryData = async () => {
    try {
      const data = await apiService.getTelemetryData();
      setTelemetryData(data);
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

  const chartData = telemetryData.map((data) => ({
    time: formatTime(data.timestamp),
    voltage: parseFloat(data.solar_voltage.toFixed(2)),
    generated: parseFloat(data.energy_generated.toFixed(2)),
    consumed: parseFloat(data.energy_consumed.toFixed(2)),
    battery: parseFloat(data.battery_percentage.toFixed(1)),
    current: parseFloat(data.load_current.toFixed(2)),
  }));

  const currentBattery = telemetryData.length > 0 
    ? telemetryData[telemetryData.length - 1].battery_percentage 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Telemetry Charts</h1>
        <p className="text-muted-foreground mt-1">Detailed performance metrics over the last 24 hours</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading charts...</div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Solar Voltage Line Chart */}
          <Card className="border-border md:col-span-2">
            <CardHeader>
              <CardTitle>Solar Voltage (Last 24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="voltage"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    name="Voltage (V)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Energy Generated vs Consumed Bar Chart */}
          <Card className="border-border md:col-span-2">
            <CardHeader>
              <CardTitle>Energy Generated vs Consumed</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
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

          {/* Battery Percentage Gauge */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Current Battery Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={currentBattery > 50 ? 'hsl(var(--success))' : currentBattery > 20 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
                      strokeWidth="8"
                      strokeDasharray={`${currentBattery * 2.51} 251`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-foreground">
                        {currentBattery.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Battery</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Load Current Area Chart */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Load Current Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.3}
                    name="Current (A)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
