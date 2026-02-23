import { useState, useEffect } from "react";
import api from "../../api/client";
import "./adminFgtsLote.css";

export default function AdminUploadFgtsLote({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [idPromotor, setIdPromotor] = useState("");
  const [instituicao, setInstituicao] = useState("VCTex");

  const [usuarios, setUsuarios] = useState([]);
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsuarios(buscaUsuario);
    }, 400);

    return () => clearTimeout(timeout);
  }, [buscaUsuario]);

  const fetchUsuarios = async (pesquisa = "") => {
    try {
      setLoadingUsuarios(true);

      const response = await api.get(
        `/usuarios?pesquisa=${pesquisa}&pagina=1&limite=10`
      );

      const lista = response.data?.data || response.data || [];

      const promotores = lista.filter(
        (usuario) => usuario.role === "promotor"
      );

      setUsuarios(promotores);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErro("Selecione um arquivo CSV.");
      return;
    }

    if (!idPromotor) {
      setErro("Selecione um promotor.");
      return;
    }

    try {
      setLoading(true);
      setErro(null);
      setMensagem(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("id_promotor", idPromotor);
      formData.append("instituicao", instituicao);

      await api.post("/consultas/FGTS/lote", formData);

      setMensagem("Consulta em lote enviada com sucesso!");
      setFile(null);
      setIdPromotor("");
      setBuscaUsuario("");
      setUsuarios([]);

      if (onSuccess) onSuccess();

    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setErro(backendMessage || "Erro ao enviar consulta em lote.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">Upload Consulta FGTS em Lote</h2>

      <div className="admin-form">

  {/* Linha 1 - Arquivo + Botão */}
  <div className="admin-row">
    <div className="admin-input-group">
      <label>Arquivo CSV</label>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />
    </div>

    <button
      className="btn-admin"
      onClick={handleUpload}
      disabled={loading}
    >
      {loading ? "Enviando..." : "Enviar CSV"}
    </button>
  </div>

  {/* Promotor + Instituição lado a lado */}
  <div className="admin-row">
    <div className="admin-input-group">
      <label>Selecionar Promotor</label>
      <select
        value={idPromotor}
        onChange={(e) => setIdPromotor(e.target.value)}
      >
        <option value="">Selecione</option>
        {usuarios.map((usuario) => (
          <option key={usuario.id} value={usuario.id}>
            {usuario.username}
          </option>
        ))}
      </select>
    </div>

    <div className="admin-input-group">
      <label>Instituição</label>
      <select
        value={instituicao}
        onChange={(e) => setInstituicao(e.target.value)}
      >
        <option value="VCTex">VCTex</option>
        <option value="Nossa fintech">Nossa Fintech</option>
      </select>
    </div>
  </div>

  {mensagem && (
    <div className="admin-card success">
      {mensagem}
    </div>
  )}

  {erro && (
    <div className="admin-card error">
      {erro}
    </div>
  )}

</div>
    </div>
  );
}