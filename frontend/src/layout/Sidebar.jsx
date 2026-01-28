import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { routesConfig } from "../config/routesConfig";
import "./sidebar.css";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const permissions = user.permissions || [];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      
      {/* TOPO */}
      <div className="sidebar-top">
        <h2>Omni Tech AI</h2>
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">
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

      {/* RODAPÉ */}
      <div className="sidebar-footer">
        <span className="sidebar-user">{user.name}</span>
        <button onClick={handleLogout} className="logout-btn">
          Sair
        </button>
      </div>
    </aside>
  );
}
