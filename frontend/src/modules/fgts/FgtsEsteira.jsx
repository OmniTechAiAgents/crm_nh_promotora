import { useEffect, useState } from "react";
import api from "../../api/client";
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

  const [copiadoId, setCopiadoId] = useState(null);
  const [linksClicados, setLinksClicados] = useState([]);

  const [propostaSelecionada, setPropostaSelecionada] = useState(null);
  const [drawerAberto, setDrawerAberto] = useState(false);

  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  async function fetchPropostas() {
    try {
      setLoading(true);

      const response = await api.get("/propostas/FGTS", {
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

    try {
      setCancelando(true);

      await api.patch(
        "/propostas/FGTS/cancelar",
        { proposalId: propostaSelecionada.proposal_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMostrarConfirmacao(false);
      fecharDrawer();

      await fetchPropostas();

      alert("Proposta cancelada com sucesso.");
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      alert("Erro ao cancelar proposta.");
    } finally {
      setCancelando(false);
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
                    <td>{proposta.API}</td>
                    <td>R$ {proposta.valor_liquido}</td>
                    <td>{proposta.status_proposta}</td>

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
                <strong>Nome:</strong> {propostaSelecionada.nome}
              </div>

              <div className="drawer-section">
                <strong>CPF:</strong> {propostaSelecionada.cpf}
              </div>

              <div className="drawer-section">
                <strong>Contrato:</strong>{" "}
                {propostaSelecionada.numero_contrato || "-"}
              </div>

              <div className="drawer-section">
                <strong>Banco:</strong> {propostaSelecionada.API}
              </div>

              <div className="drawer-section">
                <strong>Status:</strong>{" "}
                {propostaSelecionada.status_proposta}
              </div>

              <div className="drawer-section">
                <strong>Mensagem Status:</strong>{" "}
                {propostaSelecionada.msg_status || "-"}
              </div>

              <div className="drawer-section">
                <strong>Valor Líquido:</strong> R${" "}
                {propostaSelecionada.valor_liquido}
              </div>

              <div className="drawer-section">
                <strong>Valor Seguro:</strong> R${" "}
                {propostaSelecionada.valor_seguro}
              </div>

              <div className="drawer-section">
                <strong>Valor Emissão:</strong> R${" "}
                {propostaSelecionada.valor_emissao}
              </div>

              <div className="drawer-section">
                <strong>Data Criação:</strong>{" "}
                {new Date(
                  propostaSelecionada.createdAt
                ).toLocaleString("pt-BR")}
              </div>

              {propostaSelecionada.link_form && (
                <div className="drawer-section">
                  <strong>Link Formalização:</strong>
                  <br />
                  {propostaSelecionada.link_form}
                </div>
              )}

              {/* ===== BOTÃO CONTROLADO PELO BOOLEAN ===== */}

              {propostaSelecionada.verificar === true && (
                <div className="drawer-actions">
                  <button
                    className="btn-cancelar"
                    onClick={() => setMostrarConfirmacao(true)}
                  >
                    Cancelar Proposta
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================= MODAL ================= */}

      {mostrarConfirmacao && (
        <div className="modal-overlay">
          <div className="modal-confirmacao">
            <h3>Cancelar Proposta</h3>
            <p>Tem certeza que deseja cancelar esta proposta?</p>

            <div className="modal-actions">
              <button
                className="btn-secundario"
                onClick={() => setMostrarConfirmacao(false)}
              >
                Voltar
              </button>

              <button
                className="btn-cancelar"
                onClick={handleCancelarProposta}
                disabled={cancelando}
              >
                {cancelando ? "Cancelando..." : "Confirmar Cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
