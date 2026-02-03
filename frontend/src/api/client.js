import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ajuste da porta
});

api.interceptors.request.use(config => {
  const authData = JSON.parse(localStorage.getItem("auth_data"));

  if (authData?.token) {
    config.headers.Authorization = `Bearer ${authData.token}`;
  }

  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("auth_data");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
