import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PermissionRoute({ children, permission }) {
  const { user, authLoading } = useAuth();

  // ainda validando sessão
  if (authLoading) {
    return <div>Carregando sessão...</div>;
  }

  // não logado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // sem permissão
  if (permission && !user.permissions?.includes(permission)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
