import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>CRM NH</h1>
      </div>

      <div className="header-right">
        {user && (
          <>
            <span className="user-name">
              {user.username}
            </span>

            <button onClick={handleLogout} className="logout-btn">
              Sair
            </button>
          </>
        )}
      </div>
    </header>
  );
}
