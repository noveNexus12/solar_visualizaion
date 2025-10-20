import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  // Always read directly from localStorage
  const token = localStorage.getItem("token");

  if (token) {
    return <Outlet />; // user is authenticated
  }

  // Redirect if no token
  return <Navigate to="/" replace />;
};

export default PrivateRoute;
