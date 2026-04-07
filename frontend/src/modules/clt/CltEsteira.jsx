import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import "./CltEsteira.css";

export default function CltEsteira() {
  const { token } = useAuth();

  const [propostas, setPropostas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limite] = useState(10);
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(false);

  const [copiadoId, setCopiadoId] = useState(null);
  const [linksClicados, setLinksClicados] = useState([]);

  const [propostaSelecionada, setPropostaSelecionada] = useState(null);
  const [drawerAberto, setDrawerAberto] = useState(false);

  const [cancelando, setCancelando] = useState(false);

  async function fetchPropostas() {
    try {
      setLoading(true);

      const response = await api.get("/propostas/CLT", {
        params: { pesquisa, pagina, limite },
        headers: { Authorization: `Bearer ${token}` },
      });

      setPropostas(response.data?.data || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error("Erro ao buscar propostas:", error);
      setPropostas([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchPropostas();
  }, [pagina, token]);

  function handleBuscar() {
    setPagina(1);
    fetchPropostas();
  }

  function handleLimpar() {
    setPesquisa("");
    setPagina(1);
    fetchPropostas();
  }

  async function handleCopy(link, id) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiadoId(id);

      if (!linksClicados.includes(id)) {
        setLinksClicados((prev) => [...prev, id]);
      }

      setTimeout(() => {
        setCopiadoId(null);
      }, 1000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  }

  function handleDetalhar(proposta) {
    setPropostaSelecionada(proposta);
    setDrawerAberto(true);
  }

  function fecharDrawer() {
    setDrawerAberto(false);
    setPropostaSelecionada(null);
  }

  async function handleCancelarProposta() {
    if (!propostaSelecionada) return;

    const motivo = prompt("Tem certeza de que deseja cancelar? Se sim, digite o motivo:");

    if (motivo !== null) {
      
      if (motivo.trim() === "") {
        alert("O motivo é obrigatório para cancelar a proposta.");
        return;
      }

      try {
        setCancelando(true);

        const bodyCancelar = {
          proposalId: propostaSelecionada.id_proposta,
          motivo: motivo,
          instituicao: propostaSelecionada.API
        };

        await api.patch("/propostas/CLT/cancelar", bodyCancelar);

        await fetchPropostas();
        fecharDrawer();
        
        alert("Proposta cancelada com sucesso.");
      } catch (error) {
        console.error("Erro ao cancelar:", error);
        alert("Erro ao cancelar proposta.");
      } finally {
        setCancelando(false);
      }
    }
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
    <>
      <div className="esteira-container">
        <h1>Esteira de Propostas FGTS</h1>

        <div className="busca-container">
          <input
            type="text"
            placeholder="DIGITE O CPF"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
          <button onClick={handleBuscar}>BUSCAR</button>
          <button onClick={handleLimpar}>LIMPAR</button>
        </div>

        {loading ? (
          <p>Carregando propostas...</p>
        ) : propostas.length === 0 ? (
          <p>Nenhuma proposta encontrada.</p>
        ) : (
          <div className="tabela-card">
            <table className="tabela-propostas">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Proposta</th>
                  <th>Banco</th>
                  <th>Promotor</th>
                  <th>Valor Líquido</th>
                  <th>Status</th>
                  <th>Formalização</th>
                  <th>Data Criação</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {propostas.map((proposta) => (
                  <tr key={proposta.id}>
                    <td>{proposta.nome}</td>
                    <td>{proposta.numero_contrato || "-"}</td>
                    <td>{proposta.API || "-"}</td>

                    {/* NOVO CAMPO */}
                    <td>
                      {proposta.usuario?.username || "-"}
                    </td>

                    <td>R$ {proposta.valor_liberado}</td>
                    <td>{proposta.status_nome}</td>

                    {/* função para simplificar o link e deixar o site mais bonito */}
                    {/* <td className="link-coluna">
                        {proposta.link_form ? (
                            <span
                            className={`link-formalizacao ${
                                linksClicados.includes(proposta.id) ? "link-visitado" : ""
                            }`}
                            // Aqui você continua passando o link completo (proposta.link_form)
                            onClick={() => handleCopy(proposta.link_form, proposta.id)}
                            >
                            {copiadoId === proposta.id
                                ? "Copiado!"
                                : proposta.link_form.length > 15
                                ? `${proposta.link_form.substring(0, 15)}...`
                                : proposta.link_form}
                            </span>
                        ) : (
                            "-"
                        )}
                    </td> */}

                    <td className="link-coluna">
                      {proposta.link_form ? (
                        <span
                          className={`link-formalizacao ${
                            linksClicados.includes(proposta.id)
                              ? "link-visitado"
                              : ""
                          }`}
                          onClick={() =>
                            handleCopy(proposta.link_form, proposta.id)
                          }
                        >
                          {copiadoId === proposta.id
                            ? "Copiado!"
                            : proposta.link_form}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      {new Date(proposta.createdAt).toLocaleDateString("pt-BR")}
                    </td>

                    <td>
                      <button
                        className="detalhar-btn"
                        onClick={() => handleDetalhar(proposta)}
                      >
                        Detalhar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination-container">{renderPagination()}</div>
      </div>

      {/* ================= DRAWER ================= */}

      {drawerAberto && propostaSelecionada && (
        <>
          <div className="drawer-overlay" onClick={fecharDrawer}></div>

          <div className="drawer">
            <div className="drawer-header">
              <h2>Detalhes da Proposta</h2>
              <button onClick={fecharDrawer}>✕</button>
            </div>

            <div className="drawer-content">
                <div className="drawer-section">
                    <strong>Promotor:</strong>{" "}
                    {propostaSelecionada.usuario?.username || "-"}
                </div>

                <div className="drawer-section">
                    <strong>Nome:</strong> {propostaSelecionada.nome}
                </div>

                <div className="drawer-section">
                    <strong>Proposta:</strong>{" "}
                        {propostaSelecionada.numero_contrato || "-"}
                </div>

                <div className="drawer-section">
                    <strong>CPF:</strong> {propostaSelecionada.cpf}
                </div>

                <div className="drawer-section">
                    <strong>Banco:</strong> {propostaSelecionada.API}
                </div>

                <div className="drawer-section">
                    <strong>Status:</strong> {propostaSelecionada.status_nome}
                </div>
                <div className="drawer-section">
                    <strong>Valor Líquido:</strong> R$ {propostaSelecionada.valor_liberado}
                </div>

                {propostaSelecionada.verificar && (
                    <div className="drawer-actions">
                    <button
                        className="btn-cancelar"
                        onClick={handleCancelarProposta}
                    >
                        Cancelar Proposta
                    </button>
                    </div>
                )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
