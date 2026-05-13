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
  const [telaReatribuicao, setTelaReatribuicao] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(0);
  const [loadingReatribuicao, setLoadingReatribuicao] = useState(false);

  useEffect(() => {
    fetchLotes();
    fetchUsers();
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

  const countStatus = (status) =>
    lotes.filter((l) => l.status === status).length;

  const fetchUsers = async () => {
    try {
      const response = await api.get(
        `/usuarios?pesquisa=&pagina=1&limite=100000`
      );

      setUsuarios(response.data.data);
    } catch (err) {
      console.error("Erro ao buscar usuarios:", err);
    }
  }

  const handleChangeUser = (event) => {
    setSelectedUserId(event.target.value)
  }

  const handleReatribuirLote = async () => {
    setLoadingReatribuicao(true);
    
    if(selectedUserId == 0) return alert("Selecione algum usuário.")

    try {
      const response = await api.patch(
        `/consultas/FGTS/lote/reatribuir`,
        {
          id_consulta_lote: telaReatribuicao.id,
          id_novo_promotor: selectedUserId
        }
      );

      alert(response.data.msg);
    } catch(err) {
      alert(`Erro ao reatribuir lote: ${err.response.data.erro}`);
    } finally {
      setLoadingReatribuicao(false);
      fetchLotes();
      setTelaReatribuicao(null);
    }
  }

  return (
    <div className="admin-container">
      <h2 className="admin-title">Consultas FGTS em Lote</h2>

      {/* FILTRO */}
      <div className="admin-input-group busca-fgts-lote" style={{ marginBottom: 20 }}>
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
      <section className="admin-status-card-group">
        <div className="admin-status-card success-count">
          Concluídos: {countStatus("concluido")}
        </div>
        <div className="admin-status-card error-count">
          Erro: {countStatus("erro")}
        </div>
        <div>
          <button onClick={fetchLotes} className="btn-secundario">
            Recarregar
          </button>
        </div>
      </section>

      {loading && <p>Carregando...</p>}

      {/* LISTAGEM */}
      <section className="lista-fgts-lote">
        {lotes.map((lote) => (
          <div key={lote.id} className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{lote.instituicao}</strong>

              <span
                className={`badge ${lote.status === "concluido"
                  ? "verde"
                  : lote.status === "erro"
                    ? "vermelho"
                    : "cinza"
                  }`}
              >
                {lote.status == "em_andamento" ? `em_andamento: ${lote.progresso}%` : lote.status}
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
                // flexWrap: "wrap",
              }}
            >
              <button
                className="btn-secundario"
                onClick={() => setDetalhe(lote)}
              >
                Ver detalhes
              </button>
              <button
                className="btn-secundario"
                onClick={() => setTelaReatribuicao(lote)}
              >
                Reatribuir lote
              </button>
            </div>
          </div>
        ))}
      </section>

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
        <>
          <div className="overlay" onClick={() => setDetalhe(null)}></div>
          <div className="admin-modal-fgts-lote" style={{ marginTop: 30 }}>
            <h3>Detalhes do Lote #{detalhe.id}</h3>

            <br />
            <p><strong>Status:</strong> {detalhe.status}</p>
            <p><strong>Mensagem:</strong> {detalhe.mensagem}</p>
            <p><strong>Arquivo:</strong> {detalhe.local_path}</p>
            <p><strong>Admin:</strong> {detalhe.admin?.username}</p>
            <p><strong>Promotor:</strong> {detalhe.promotor?.username}</p>

            <br />
            <h3>Detalhes financeiros do lote</h3>
            <p><strong>Qtd. clientes elegiveis:</strong> {detalhe.resumo.quantidade}</p>
            <p><strong>Saldo total:</strong> R${detalhe.resumo.saldoTotal.toFixed(2)}</p>
            <p><strong>Valor bruto total:</strong> R${detalhe.resumo.valorBrutoTotal.toFixed(2)}</p>
            <p><strong>Valor líquido total:</strong> R${detalhe.resumo.valorLiquidoTotal.toFixed(2)}</p>

            <button
              className="btn-admin"
              style={{ marginTop: 15 }}
              onClick={() => setDetalhe(null)}
            >
              Fechar
            </button>
          </div>
        </>
      )}

      {telaReatribuicao && (
        <>
          <div className="overlay" onClick={() => setTelaReatribuicao(null)}></div>
          <div className="admin-modal-fgts-lote admin-modal-fgts-reatribuicao" style={{ marginTop: 30 }}>
            <h3>Reatribuição do Lote #{telaReatribuicao.id}</h3>

            <p><strong>Esse lote pertence ao usuário:</strong> <br />{usuarios.find(u => u.id === telaReatribuicao.promotor.id)?.username || "Desconhecido"}</p>

            <div>
              <p><strong>Selecione o novo usuário:</strong></p>

              <select
                id="user-select"
                value={selectedUserId}
                onChange={handleChangeUser}
              >
                <option value="">-- Escolha um usuário --</option>

                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="div-btns-reatribuicao-lote">
              <button
                className="btn-admin btn-fechar"
                onClick={() => setTelaReatribuicao(null)}
              >
                Fechar
              </button>
              
              <button
                className="btn-admin"
                onClick={() => handleReatribuirLote()}
              >
                Reatribuir
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}