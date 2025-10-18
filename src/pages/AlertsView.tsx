import { useEffect, useState } from 'react';
import { AlertTriangle, Bell, Info, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/api.service';
import { Alert } from '@/lib/mockData';
import { toast } from 'sonner';

export default function AlertsView() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(() => {
      loadAlerts();
      // Simulate new alert notifications
      if (alerts.length && Math.random() > 0.7) {
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        if (randomAlert) showAlertNotification(randomAlert);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [alerts]);

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

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <Bell className="h-5 w-5 text-warning" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alerts & Notifications</h1>
        <p className="text-muted-foreground mt-1">
          System alerts and pole status notifications
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {alerts.filter(a => a.severity === 'critical').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {alerts.filter(a => a.severity === 'warning').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {alerts.filter(a => a.severity === 'info').length}
            </div>
          </CardContent>
        </Card>
      </div>

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
                  className="flex flex-col gap-2 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">{getAlertIcon(alert.severity)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{alert.message}</p>
                        <Badge
                          variant={getAlertColor(alert.severity) as any}
                          className="capitalize"
                        >
                          {alert.severity}
                        </Badge>
                        <Badge
                          variant={alert.alert_status === 'RESOLVED' ? 'secondary' : 'destructive'}
                          className="capitalize"
                        >
                          {alert.alert_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Pole: {alert.pole_id}</span>
                        <span>•</span>
                        <span>Type: {alert.alert_type}</span>
                        <span>•</span>
                        <span>{formatTimestamp(alert.timestamp)}</span>
                      </div>
                      {alert.technician_id && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Technician: {alert.technician_id}</span>
                          {alert.action_taken && <span>• Action: {alert.action_taken}</span>}
                          {alert.remarks && <span>• Remarks: {alert.remarks}</span>}
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
