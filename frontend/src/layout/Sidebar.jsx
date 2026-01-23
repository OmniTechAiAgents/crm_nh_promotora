import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { routesConfig } from "../config/routesConfig";

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const permissions = user.permissions || [];

  return (
    <aside className="sidebar">
      <h2>Omni Tech AI</h2>

      <nav>
        <ul>
          {routesConfig
            .filter(
              route =>
                route.showInMenu &&
                (!route.permission ||
                  permissions.includes(route.permission))
            )
            .map(route => (
              <li key={route.path}>
                <NavLink to={route.path}>
                  {route.label}
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>
    </aside>
  );
}
