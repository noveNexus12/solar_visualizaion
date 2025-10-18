import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/api.service';
import { Pole } from '@/lib/mockData';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icons
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapView() {
  const [poles, setPoles] = useState<Pole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoles();
    const interval = setInterval(loadPoles, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPoles = async () => {
    try {
      const data = await apiService.getPoles();
      setPoles(data);
    } catch (error) {
      console.error('Error loading poles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Map View</h1>
        <p className="text-muted-foreground mt-1">Real-time location and status of all poles</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pole Locations</span>
            <div className="flex gap-3 text-sm font-normal">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-muted-foreground">Online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Offline</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full rounded-lg overflow-hidden border border-border">
            {!loading && (
              <MapContainer
                center={[20.5937, 78.9629]} // Center of India
                zoom={5}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {poles.map((pole) => (
                  <Marker
                    key={pole.pole_id}
                    position={[pole.latitude, pole.longitude]}
                    icon={pole.status === 'ON' ? greenIcon : redIcon}
                  >
                    <Popup>
                      <div className="space-y-2 min-w-[200px]">
                        <div className="font-semibold text-lg">{pole.pole_id}</div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge
                              variant={pole.status === 'ON' ? 'default' : 'destructive'}
                              className="ml-2"
                            >
                              {pole.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Cluster:</span>
                            <span className="font-medium">{pole.cluster_id}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Battery:</span>
                            <span className="font-medium">{pole.battery_percentage}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Communication:</span>
                            <Badge
                              variant={pole.communication_status === 'ONLINE' ? 'default' : 'outline'}
                              className="ml-2"
                            >
                              {pole.communication_status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
