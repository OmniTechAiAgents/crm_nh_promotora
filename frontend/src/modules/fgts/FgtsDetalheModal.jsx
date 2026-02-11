import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./FgtsEsteira.css";

export default function FgtsEsteira() {
  const { token } = useAuth();

  const [propostas, setPropostas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limite] = useState(10);
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchPropostas() {
    try {
      setLoading(true);

      const response = await axios.get(
        `/propostas/FGTS?pesquisa=${pesquisa}&pagina=${pagina}&limite=${limite}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPropostas(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Erro ao buscar propostas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPropostas();
  }, [pagina]);

  function handleBuscar() {
    setPagina(1);
    fetchPropostas();
  }

  function handleLimpar() {
    setPesquisa("");
    setPagina(1);
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
    <div className="esteira-container">
      <h1>Esteira de Propostas FGTS</h1>

      {/* BUSCA */}
      <div className="busca-container">
        <input
          type="text"
          placeholder="Buscar por CPF"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />
        <button onClick={handleBuscar}>Buscar</button>
        <button onClick={handleLimpar}>Limpar</button>
      </div>

      {/* TABELA */}
      {loading ? (
        <p>Carregando propostas...</p>
      ) : propostas.length === 0 ? (
        <p>Nenhuma proposta encontrada.</p>
      ) : (
        <table className="tabela-propostas">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Banco</th>
              <th>Valor Líquido</th>
              <th>Status</th>
              <th>Data Criação</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {propostas.map((proposta) => (
              <tr key={proposta.id}>
                <td>{proposta.nome}</td>
                <td>{proposta.cpf}</td>
                <td>{proposta.API}</td>
                <td>R$ {proposta.valor_liquido}</td>
                <td>{proposta.status_proposta}</td>
                <td>
                  {new Date(proposta.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td>
                  <button className="detalhar-btn">
                    Detalhar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* PAGINAÇÃO */}
      <div className="pagination-container">
        {renderPagination()}
      </div>
    </div>
  );
}
