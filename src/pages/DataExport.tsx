import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function DataExport() {
  const [dataset, setDataset] = useState('telemetry');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleDownload = () => {
    let url = `${API_BASE_URL}/export/${dataset}`;
    if (start && end) url += `?start=${start}&end=${end}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Data Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Dataset</label>
              <Select onValueChange={setDataset} defaultValue={dataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="telemetry">Telemetry</SelectItem>
                  <SelectItem value="alerts">Alerts</SelectItem>
                  <SelectItem value="poles">Poles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Start Date</label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">End Date</label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleDownload} className="mt-4 flex items-center gap-2">
            <Download className="w-4 h-4" /> Download CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
