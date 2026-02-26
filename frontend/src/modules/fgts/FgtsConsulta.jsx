import { useState } from "react";
import FgtsResultadoCard from "./FgtsResultadoCard";
import api from "../../api/client";
import "./fgts.css";

// Função para normalizar o CPF
function normalizarCPF(cpfInput) {
  if (!cpfInput) return "";

  let somenteNumeros = cpfInput.replace(/\D/g, "");

  while (somenteNumeros.length < 11) {
    somenteNumeros = "0" + somenteNumeros;
  }

  if (somenteNumeros.length > 11) {
    somenteNumeros = somenteNumeros.slice(0, 11);
  }

  return somenteNumeros;
}

// Função utilitária para extrair mensagem de erro corretamente
function getErrorMessage(error) {
  const status = error.response?.status;
  const data = error.response?.data;

  if (status === 401) {
    return "Sessão expirada. Faça login novamente.";
  }

  if (!data) {
    return error.message || "Erro inesperado.";
  }

  if (typeof data === "string") {
    return data;
  }

  return (
    data.message ||
    data.motivo ||
    data.erro ||
    data.mensagem ||
    "Erro ao consultar backend."
  );
}

export default function FgtsConsulta() {
  const [cpf, setCpf] = useState("");
  const [instituicao, setInstituicao] = useState("VCTex");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const consultar = async () => {
    setResultado(null);

    const cpfNormalizado = normalizarCPF(cpf);

    try {
      setLoading(true);

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
          cpf: cpfNormalizado,
          instituicao,
        }
      );

      // Definição de status de negócio
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
        financialId: data.chave,
        motivoErro: data.motivo || null,
      };

      setResultado(ofertaTratada);

    } catch (err) {
      console.error("ERRO CONSULTA:", err);

      setResultado({
        status: "ERRO",
        motivoErro: getErrorMessage(err),
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
            onChange={(e) => setCpf(e.target.value)}
            maxLength={14}
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
      </div>

      {/* RESULTADO */}
      {resultado && <FgtsResultadoCard resultado={resultado} />}
    </div>
  );
}