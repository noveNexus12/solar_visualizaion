import { useEffect, useState } from "react";
import { Activity, Zap, AlertTriangle, Power, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/services/api.service";

interface Stats {
  total: number;
  active: number;
  inactive: number;
  alerts: number;
}

interface UserInfo {
  name: string;
  role: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    alerts: 0,
  });

  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadStats();
    loadUser();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    try {
      const data = await apiService.getCurrentUser();
      if (!data) {
        window.location.href = "/signin";
        return;
      }
      setUser(data);
    } catch (err) {
      console.error("User fetch failed:", err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiService.getStats();
      setStats({
        total: data.total ?? 0,
        active: data.active ?? 0,
        inactive: data.inactive ?? 0,
        alerts: data.alerts ?? 0,
      });
    } catch (err) {
      console.error("Stats fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: "Total Poles",
      value: stats.total,
      icon: Activity,
      description: "All registered poles",
      color: "text-blue-400",
      bgColor: "bg-blue-900/30",
    },
    {
      title: "Active Poles",
      value: stats.active,
      icon: Zap,
      description: "Currently operational",
      color: "text-green-400",
      bgColor: "bg-green-900/30",
    },
    {
      title: "Inactive Poles",
      value: stats.inactive,
      icon: Power,
      description: "Not operational",
      color: "text-gray-400",
      bgColor: "bg-gray-800/40",
    },
    {
      title: "Active Alerts",
      value: stats.alerts,
      icon: AlertTriangle,
      description: "Requires attention",
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/30",
    },
  ];

  return (
    <div className="space-y-6 text-gray-100 relative">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">
            Monitor your smart devices in real-time
          </p>
        </div>

        {/* User Menu */}
        <div className="relative">
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="h-10 w-10 rounded-full bg-emerald-700 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-emerald-400 transition"
          >
            <User className="text-white h-5 w-5" />
          </div>

          {menuOpen && user && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1e1e1e] border border-gray-700 rounded-lg shadow-lg p-3 z-50">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>

              <hr className="my-2 border-gray-700" />

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/signin";
                }}
                className="w-full text-left text-sm text-red-400 hover:text-red-300 transition"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, index) => (
          <Card
            key={card.title}
            className="hover:shadow-lg transition bg-[#1e1e1e] border border-gray-800 rounded-xl"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold text-white">
                {loading ? "..." : card.value}
              </div>
              <p className="text-xs text-gray-400 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status */}
      <Card className="border border-gray-800 bg-[#1b1b1b] rounded-xl">
        <CardHeader>
          <CardTitle className="text-white">System Status</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-200">
                  System Online
                </span>
              </div>
              <span className="text-xs text-gray-400">
                All services operational
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-200">
                  Database Connected
                </span>
              </div>
              <span className="text-xs text-gray-400">Latency: 10–15ms</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-200">
                  Data Sync Active
                </span>
              </div>
              <span className="text-xs text-gray-400">
                Last sync: Just now
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
