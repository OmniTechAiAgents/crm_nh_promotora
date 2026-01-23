import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // ajuste se necessário
});

// 🔹 Request interceptor → injeta token
api.interceptors.request.use(
  (config) => {
    const storedAuth = localStorage.getItem("auth_data");

    if (storedAuth) {
      const { token } = JSON.parse(storedAuth);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response interceptor → trata 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_data");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
