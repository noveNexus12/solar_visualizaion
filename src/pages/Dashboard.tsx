import { useEffect, useState } from 'react';
import { Activity, Zap, AlertTriangle, Power } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/services/api.service';

interface Stats {
  total: number;
  active: number;
  inactive: number;
  alerts: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    alerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiService.getStats();
      if (data) {
        setStats({
          total: data.total ?? 0,
          active: data.active ?? 0,
          inactive: data.inactive ?? 0,
          alerts: data.alerts ?? 0,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total Poles',
      value: stats.total,
      icon: Activity,
      description: 'All registered poles',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Poles',
      value: stats.active,
      icon: Zap,
      description: 'Currently operational',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Inactive Poles',
      value: stats.inactive,
      icon: Power,
      description: 'Not operational',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
    },
    {
      title: 'Active Alerts',
      value: stats.alerts,
      icon: AlertTriangle,
      description: 'Requires attention',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your smart devices in real-time
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, index) => (
          <Card
            key={card.title}
            className="hover:shadow-lg transition-shadow duration-300 animate-scale-in border-border"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {loading ? '...' : card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium">System Online</span>
              </div>
              <span className="text-xs text-muted-foreground">All services operational</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-sm font-medium">Database Connected</span>
              </div>
              <span className="text-xs text-muted-foreground">Latency: 10–15ms</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-sm font-medium">Data Sync Active</span>
              </div>
              <span className="text-xs text-muted-foreground">Last sync: Just now</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
