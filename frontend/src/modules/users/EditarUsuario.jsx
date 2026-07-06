import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import "./Users.css";

export default function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function fetchUsuario() {
    try {
      const response = await api.get(`/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsername(response.data.username);
      setRole(response.data.role);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        navigate("/erro");
        return;
      }

      setMensagem(`Erro ao carregar dados do usuário: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token && id) fetchUsuario();
  }, [token, id]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSalvando(true);
      const response = await api.put(
        `/usuarios/${id}`,
        { username, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Usuário atualizado com sucesso!");

      setTimeout(() => {
        navigate("/usuarios");
      }, 500);

    } catch (error) {
      setMensagem("Erro ao atualizar usuário.");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return <p className="loading-text">Carregando usuário...</p>;
  }

  return (
    <div className="editar-container">
      <h2>Editar Usuário</h2>

      <form onSubmit={handleSubmit} className="editar-form">
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Nível permissão</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Selecione</option>
            <option value="admin">Admin</option>
            <option value="promotor">Promotor</option>
          </select>
        </div>

        <button type="submit" disabled={salvando} className="btn-salvar">
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </form>

      {mensagem && <p className="mensagem">{mensagem}</p>}
    </div>
  );
}