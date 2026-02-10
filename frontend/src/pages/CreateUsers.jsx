import { useState } from "react";
import api from "../api/client.js";
import "./createusers.css";

export default function CreateUser() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "promotor",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/registro", form);

      setSuccess("Usuário criado com sucesso!");
      setForm({
        username: "",
        password: "",
        role: "promotor",
      });
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Usuário já existe.");
      } else {
        setError("Erro ao criar usuário. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-user-container">
      <div className="create-user-card">
        <h2>Criar novo usuário</h2>

        <form className="create-user-form" onSubmit={handleSubmit}>
          <div>
            <label>Usuário</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Senha</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Perfil</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="promotor">Promotor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Criando..." : "Criar usuário"}
          </button>
        </form>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}
      </div>
    </div>
  );
}
