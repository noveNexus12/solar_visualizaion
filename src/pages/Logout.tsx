import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Redirect to landing page
    navigate("/", { replace: true });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2 mt-4 w-full"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
};

export default Logout;
