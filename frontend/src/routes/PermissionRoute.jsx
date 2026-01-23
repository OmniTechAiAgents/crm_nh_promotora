import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PermissionRoute({ children, permission }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (permission) {
    const permissions = user.permissions || [];
    if (!permissions.includes(permission)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return children;
}
