import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import PermissionRoute from "./routes/PermissionRoute";
import { routesConfig } from "./config/routesConfig";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";

export default function App() {
  return (
    <Routes>

      {/* 🔁 rota raiz */}
      <Route path="/" element={<Navigate to="/fgts" replace />} />

      {/* 🔓 pública */}
      <Route path="/login" element={<Login />} />

      {/* 🔐 rotas protegidas */}
      {routesConfig.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <PermissionRoute permission={route.permission}>
              {route.element}
            </PermissionRoute>
          }
        />
      ))}

      {/* 🚫 acesso negado */}
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* ❌ 404 */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}
