import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import PermissionRoute from "./routes/PermissionRoute";
import { routesConfig } from "./config/routesConfig";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";
import Layout from "./layout/Layout";
import CreateUser from "./pages/CreateUsers";

export default function App() {
  return (
    <Routes>

      {/* raiz */}
      <Route path="/" element={<Navigate to="/fgts" replace />} />

      {/* pública */}
      <Route path="/login" element={<Login />} />

      {/* criaação de usuários - ADMIN */}
      {/* <Route
        path="/registro"
        element={
          <PermissionRoute role="admin">
            <CreateUser />
          </PermissionRoute>
        }
      /> */}

      {/* BLOCO COM LAYOUT */}
      <Route element={<Layout />}>

        {routesConfig.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <PermissionRoute role={route.role}>
                {route.element}
              </PermissionRoute>
            }
          />
        ))}

      </Route>

      {/* acesso negado */}
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}
