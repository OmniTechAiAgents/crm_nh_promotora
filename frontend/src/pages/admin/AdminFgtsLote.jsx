import { useEffect, useState } from "react";
import api from "../../api/client";
import "./adminFgtsLote.css";

export default function AdminFgtsLote() {
  const [lotes, setLotes] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(false);
  const [detalhe, setDetalhe] = useState(null);

  useEffect(() => {
    fetchLotes();
  }, [pagina, pesquisa]);

  const fetchLotes = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/consultas/FGTS/lote?pesquisa=${pesquisa}&limite=15&pagina=${pagina}`
      );

      setLotes(response.data?.data || []);
      setTotalPages(response.data?.totalPages || 1);

    } catch (err) {
      console.error("Erro ao buscar lotes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Deseja realmente excluir este lote?")) return;

    try {
      await api.delete(`/consultas/FGTS/lote/${id}`);
      fetchLotes();
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  const handleReenviar = async (id) => {
    try {
      await api.post(`/consultas/FGTS/lote/${id}/reenviar`);
      fetchLotes();
    } catch (err) {
      alert("Erro ao reenviar.");
    }
  };

  const countStatus = (status) =>
    lotes.filter((l) => l.status === status).length;

  return (
    <div className="admin-container">
      <h2 className="admin-title">Consultas FGTS em Lote</h2>

      {/* FILTRO */}
      <div className="admin-input-group" style={{ marginBottom: 20 }}>
        <label>Buscar</label>
        <input
          type="text"
          placeholder="Pesquisar por instituição ou promotor..."
          value={pesquisa}
          onChange={(e) => {
            setPagina(1);
            setPesquisa(e.target.value);
          }}
        />
      </div>

      {/* CONTADORES */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div className="admin-card success">
          Concluídos: {countStatus("concluido")}
        </div>
        <div className="admin-card error">
          Erro: {countStatus("erro")}
        </div>
      </div>

      {loading && <p>Carregando...</p>}

      {/* LISTAGEM */}
      {lotes.map((lote) => (
        <div key={lote.id} className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{lote.instituicao}</strong>

            <span
              className={`badge ${
                lote.status === "concluido"
                  ? "verde"
                  : lote.status === "erro"
                  ? "vermelho"
                  : "cinza"
              }`}
            >
              {lote.status}
            </span>
          </div>

          <p style={{ fontSize: 13, marginTop: 6 }}>
            Promotor: <strong>{lote.promotor?.username}</strong>
          </p>

          <p style={{ fontSize: 13 }}>
            Criado em:{" "}
            {new Date(lote.createdAt).toLocaleString("pt-BR")}
          </p>

          <div
            style={{
              marginTop: 15,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn-secundario"
              onClick={() => setDetalhe(lote)}
            >
              Ver detalhes
            </button>

            <button
              className="btn-admin"
              onClick={() => handleReenviar(lote.id)}
            >
              Reenviar
            </button>

            <button
              className="btn-secundario"
              onClick={() => handleExcluir(lote.id)}
            >
              Excluir
            </button>
          </div>
        </div>
      ))}

      {/* PAGINAÇÃO */}
      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button
          className="btn-secundario"
          disabled={pagina === 1}
          onClick={() => setPagina((p) => p - 1)}
        >
          Anterior
        </button>

        <span style={{ alignSelf: "center" }}>
          Página {pagina} de {totalPages}
        </span>

        <button
          className="btn-secundario"
          disabled={pagina === totalPages}
          onClick={() => setPagina((p) => p + 1)}
        >
          Próxima
        </button>
      </div>

      {/* MODAL DETALHE */}
      {detalhe && (
        <div className="admin-card" style={{ marginTop: 30 }}>
          <h3>Detalhes do Lote #{detalhe.id}</h3>
          <p><strong>Status:</strong> {detalhe.status}</p>
          <p><strong>Mensagem:</strong> {detalhe.mensagem}</p>
          <p><strong>Arquivo:</strong> {detalhe.local_path}</p>
          <p><strong>Admin:</strong> {detalhe.admin?.username}</p>
          <p><strong>Promotor:</strong> {detalhe.promotor?.username}</p>

          <button
            className="btn-admin"
            style={{ marginTop: 15 }}
            onClick={() => setDetalhe(null)}
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}