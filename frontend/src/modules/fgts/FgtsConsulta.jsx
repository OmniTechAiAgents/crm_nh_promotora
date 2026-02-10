import { useState } from "react";
import axios from "axios";
import FgtsResultadoCard from "./FgtsResultadoCard";
import api from "../../api/client";
import "./fgts.css";

export default function FgtsConsulta() {
  const [cpf, setCpf] = useState("");
  const [instituicao, setInstituicao] = useState("VCTex");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const consultar = async () => {
    try {
      setLoading(true);
      setResultado(null);

      //BUSCA TOKEN SALVO NO LOGIN
      const authData = JSON.parse(localStorage.getItem("auth_data"));
      const token = authData?.token;

      const { data } = await api.post("/consultas/FGTS/manual",
        { cpf, instituicao },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //FRONT NÃO USA "CDC" OU RETORNO TÉCNICO DO BANCO
      const ofertaTratada = {
        status: data.proposta_id
          ? "PROPOSTA_EXISTENTE"
          : data.valor_liquido > 0
          ? "ELEGIVEL"
          : "NAO_ELEGIVEL",

        cpf: data.cpf,
        instituicaoEscolhida: instituicao,
        valorLiquido: data.valor_liquido,
        valorBruto: data.valor_bruto,
        anuidades: data.anuidades || [],
        propostaId: data.proposta_id || null,
        motivoErro: data.motivo || null,
      };

      setResultado(ofertaTratada);

    } catch (err) {
      console.error("ERRO CONSULTA:", err);

      setResultado({
        status: "ERRO",
        motivoErro:
          err.response?.status === 401
            ? "Sessão expirada. Faça login novamente."
            : "Erro ao consultar backend",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="consulta-container">
    <h2>Consulta FGTS</h2>

    {/* LINHA CPF + BOTÃO */}
    <div className="consulta-form">
      <div className="input-group">
        <label>CPF</label>
        <input
          placeholder="Digite o CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
      </div>

      <button className="btn-consultar" onClick={consultar} disabled={loading}>
        {loading ? "Consultando..." : "Consultar"}
      </button>
    </div>

    {/* INSTITUIÇÕES VOLTARAM */}
    <div className="instituicoes">
      <span className="inst-title">Instituição:</span>

      <label className="radio-option">
        <input
          type="radio"
          value="VCTex"
          checked={instituicao === "VCTex"}
          onChange={(e) => setInstituicao(e.target.value)}
        />
        VCTEX
      </label>

      <label className="radio-option">
        <input
          type="radio"
          value="Nossa fintech"
          checked={instituicao === "Nossa fintech"}
          onChange={(e) => setInstituicao(e.target.value)}
        />
        NOSSA FINTECH
      </label>

      {/* <label className="radio-option">
        <input
          type="radio"
          value="Paraná"
          checked={instituicao === "Paraná"}
          onChange={(e) => setInstituicao(e.target.value)}
        />
        Paraná
      </label> */}
    </div>

    {/* RESULTADO */}
    {resultado && <FgtsResultadoCard resultado={resultado} />}
  </div>
);
}
