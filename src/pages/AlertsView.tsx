import { useEffect, useState, useRef, type ComponentProps } from 'react';
import { AlertTriangle, Bell, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/api.service';

// Local Alert type — mockData.ts has been disabled in this workspace, so
// declare the minimal shape used by this view here to keep the file self-contained.
export type Alert = {
  id: string;
  pole_id: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  alert_status: 'ACTIVE' | 'RESOLVED' | 'PENDING';
  alert_type?: string;
  technician_id?: string;
  action_taken?: string;
  remarks?: string;
};
import { toast } from 'sonner';

export default function AlertsView() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAlerts();

    // Refresh every 15 seconds
    intervalRef.current = setInterval(() => {
      loadAlerts();
      if (alerts.length && Math.random() > 0.7) {
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        if (randomAlert) showAlertNotification(randomAlert);
      }
    }, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await apiService.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAlertNotification = (alert: Alert) => {
    const icon =
      alert.severity === 'critical'
        ? '🔴'
        : alert.severity === 'warning'
        ? '⚠️'
        : 'ℹ️';
    toast(`${icon} ${alert.message}`, {
      description: `Pole: ${alert.pole_id} | Type: ${alert.alert_type} | Status: ${alert.alert_status}`,
      duration: 5000,
    });
  };

  const getAlertIcon = (alert: Alert) => {
    if (alert.alert_status === 'RESOLVED') {
      return <Info className="h-5 w-5 text-primary" />;
    }
    switch (alert.severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <Bell className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getAlertColor = (alert: Alert) => {
    if (alert.alert_status === 'RESOLVED') return 'secondary';
    switch (alert.severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alerts & Notifications</h1>
        <p className="text-muted-foreground mt-1">
          System alerts and pole status notifications
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Critical', color: 'text-destructive', type: 'critical' },
          { label: 'Warnings', color: 'text-yellow-500', type: 'warning' },
          { label: 'Info', color: 'text-primary', type: 'info' },
        ].map(({ label, color, type }) => (
          <Card key={type} className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${color}`}>
              {alerts.filter((a) => {
                  if (type === 'info') return a.alert_status === 'RESOLVED';
                  return a.severity === type && a.alert_status !== 'RESOLVED';
          }).length}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Alerts Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading alerts...</div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No alerts at this time</p>
            </div>
          ) : (
            <div className="space-y-4">
                          {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex flex-col gap-2 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors ${
                  alert.alert_status === 'RESOLVED'
                    ? 'bg-muted/40 border-border/70'
                    : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">{getAlertIcon(alert)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">
                        {alert.message}
                      </p>

                      {/* ✅ FIXED LABEL */}
                      <Badge
                        variant={getAlertColor(alert) as ComponentProps<typeof Badge>['variant']}
                        className="capitalize"
                      >
                        {alert.alert_status === 'RESOLVED'
                          ? 'info'
                          : alert.severity}
                      </Badge>

                      <Badge
                        variant={
                          alert.alert_status === 'RESOLVED'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="capitalize"
                      >
                        {alert.alert_status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>Pole: {alert.pole_id}</span>
                      <span>•</span>
                      <span>Type: {alert.alert_type}</span>
                      <span>•</span>
                      <span>{formatTimestamp(alert.timestamp)}</span>
                    </div>

                    {alert.technician_id && (
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>Technician: {alert.technician_id}</span>
                        {alert.action_taken && (
                          <span>• Action: {alert.action_taken}</span>
                        )}
                        {alert.remarks && (
                          <span>• Remarks: {alert.remarks}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
