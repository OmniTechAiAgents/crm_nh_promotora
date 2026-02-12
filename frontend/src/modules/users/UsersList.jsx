import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import "./Users.css";

export default function UsersList() {
  const { token } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limite] = useState(5);
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchUsuarios() {
    try {
      setLoading(true);

      const response = await api.get("/usuarios", {
        params: { pesquisa, pagina, limite },
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsuarios(response.data?.data || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setUsuarios([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchUsuarios();
  }, [pagina, token]);

  function handleBuscar() {
    setPagina(1);
    fetchUsuarios();
  }

  function handleLimpar() {
    setPesquisa("");
    setPagina(1);
    fetchUsuarios();
  }

  function renderPagination() {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={i === pagina ? "active-page" : ""}
          onClick={() => setPagina(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  }

  return (
    <div className="users-container">
      <h1>Gestão de Usuários</h1>

      <div className="users-busca">
        <input
          type="text"
          placeholder="Buscar por username"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />
        <button onClick={handleBuscar}>Buscar</button>
        <button onClick={handleLimpar}>Limpar</button>
      </div>

      {loading ? (
        <p>Carregando usuários...</p>
      ) : usuarios.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <div className="users-table-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Perfil</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <button
                        className="editar-btn"
                        onClick={() => handleEditar(user)}
                        >
                            Editar Usuário
                    </button>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination-container">
        {renderPagination()}
      </div>
    </div>
  );
}
