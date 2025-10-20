import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { LogIn, ArrowLeft } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",  // ⚡ changed from emailOrPhone
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Login successful!");
        // Save token and role for PrivateRoute
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        navigate("/dashboard");
      } else {
        toast.error(data.error || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Signin error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft />
          Back to Home
        </Button>

        <Card className="shadow-[var(--shadow-card)] border-border/50">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <img src={logo} alt="Logo" className="h-16 w-16" />
            </div>
            <div>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to access your dashboard</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                <LogIn />
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link
                  to="/signup"
                  className="text-primary hover:underline font-medium"
                >
                  Sign Up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
