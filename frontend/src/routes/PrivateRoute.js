import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";

const PrivateRoute = () => {
  const { user, loading } = useAuthContext();

  if (loading) return <h1>Carregando...</h1>;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;