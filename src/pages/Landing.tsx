import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import heroIllustration from "@/assets/hero-illustration.png";
import { LogIn, UserPlus } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 animate-fade-in">
          <img src={logo} alt="Smart Pole Analytics" className="h-12 w-12" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Smart Pole Analytics
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Intelligent IoT
                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Analytics Platform
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg">
                Monitor, analyze, and optimize your smart pole infrastructure with real-time data insights and advanced analytics.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate("/signin")}
                className="group flex items-center justify-center gap-2"
              >
                <LogIn className="transition-transform group-hover:translate-x-1" />
                Sign In
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => navigate("/signup")}
                className="group flex items-center justify-center gap-2 border-2"
              >
                <UserPlus className="transition-transform group-hover:scale-110" />
                Sign Up
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
              <div className="space-y-1 text-center">
                <p className="text-2xl font-bold text-primary">24/7</p>
                <p className="text-sm text-muted-foreground">Monitoring</p>
              </div>
              <div className="space-y-1 text-center">
                <span className="text-2xl font-bold block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-md">
                  Real-time Analytics
                </span>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-2xl font-bold text-accent">Secure</p>
                <p className="text-sm text-muted-foreground">Platform</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full animate-glow" />
            <img
              src={heroIllustration}
              alt="Smart City IoT"
              className="relative rounded-2xl shadow-[var(--shadow-card)] w-full"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 mt-12">
        <p className="text-center text-sm text-muted-foreground">
          © 2025 Smart Pole Analytics. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
