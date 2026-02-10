import { useState } from "react";
import FgtsResultadoCard from "./FgtsResultadoCard";
import api from "../../api/client";
import "./fgts.css";

export default function FgtsConsulta() {
  const [cpf, setCpf] = useState("");
  const [instituicao, setInstituicao] = useState("VCTex");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const consultar = async () => {
    setResultado(null);

    // Validação básica de CPF
    if (!cpf || cpf.length !== 11) {
      setResultado({
        status: "ERRO",
        motivoErro: "CPF inválido. Digite somente números.",
      });
      return;
    }

    try {
      setLoading(true);

      // Busca token salvo no login
      const authData = JSON.parse(localStorage.getItem("auth_data"));
      const token = authData?.token;

      if (!token) {
        setResultado({
          status: "ERRO",
          motivoErro: "Sessão expirada. Faça login novamente.",
        });
        return;
      }

      const { data } = await api.post(
        "/consultas/FGTS/manual",
        {
          cpf,           // SEM máscara
          instituicao,   // Enum controlado
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // FRONT NÃO USA RETORNO TÉCNICO DO BANCO
      let status = "NAO_ELEGIVEL";

      if (data.proposta_id) {
        status = "PROPOSTA_EXISTENTE";
      } else if (data.elegivelProposta) {
        status = "ELEGIVEL";
      }

      const ofertaTratada = {
        status,
        cpf: data.cpf,
        instituicaoEscolhida: instituicao,

        valorLiquido: data.valor_liquido,
        valorBruto: data.valor_bruto,

        anuidades: data.anuidades || [],

        propostaId: data.proposta_id || null,

        // CARREGANDO FINANCIALID, ESSENCIAL PARA PRÓXIMA ETAPA
        financialId: data.chave,

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
            : err.response?.data?.mensagem || "Erro ao consultar backend",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consulta-container">
      <h2>Consulta FGTS</h2>

      {/* CPF + BOTÃO */}
      <div className="consulta-form">
        <div className="input-group">
          <label>CPF</label>
          <input
            placeholder="Digite o CPF"
            value={cpf}
            onChange={(e) =>
              setCpf(e.target.value.replace(/\D/g, ""))
            }
            maxLength={11}
          />
        </div>

        <button
          className="btn-consultar"
          onClick={consultar}
          disabled={loading}
        >
          {loading ? "Consultando..." : "Consultar"}
        </button>
      </div>

      {/* INSTITUIÇÕES */}
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

        {/* Parana */}
        {/* 
        <label className="radio-option">
          <input
            type="radio"
            value="Parana"
            checked={instituicao === "Parana"}
            onChange={(e) => setInstituicao(e.target.value)}
          />
          Paraná
        </label>
        */}
      </div>

      {/* RESULTADO */}
      {resultado && <FgtsResultadoCard resultado={resultado} />}
    </div>
  );
}
