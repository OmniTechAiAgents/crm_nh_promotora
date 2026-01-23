import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth_data");
    if (storedAuth) {
      const { user, token } = JSON.parse(storedAuth);
      setUser(user);
      setToken(token);
    }
  }, []);

  function login(authData) {
    setUser(authData.user);
    setToken(authData.token);

    localStorage.setItem(
      "auth_data",
      JSON.stringify({
        user: authData.user,
        token: authData.token,
      })
    );
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_data");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
