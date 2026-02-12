import { useState } from "react";
import FgtsResultadoCard from "./FgtsResultadoCard";
import api from "../../api/client";
import "./fgts.css";

// Função para normalizar o CPF
function normalizarCPF(cpfInput) {
  if (!cpfInput) return "";

  // Remove tudo que não é número
  let somenteNumeros = cpfInput.replace(/\D/g, "");

  // Preenche com zeros à esquerda até completar 11 caracteres
  while (somenteNumeros.length < 11) {
    somenteNumeros = "0" + somenteNumeros;
  }

  // Corta se tiver mais de 11 caracteres
  if (somenteNumeros.length > 11) {
    somenteNumeros = somenteNumeros.slice(0, 11);
  }

  return somenteNumeros;
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

      // Requisição ao backend
      const { data } = await api.post(
        "/consultas/FGTS/manual",
        {
          cpf: cpfNormalizado,
          instituicao,
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

      const status = err.response?.status;
      const data = err.response?.data;

      let motivoErro = "Erro ao consultar backend";

      if (status === 401) {
        motivoErro = "Sessão expirada. Faça login novamente.";
      } else if (data) {
        if (typeof data === "object") {
          motivoErro = data.motivo || data.erro || data.mensagem || JSON.stringify(data);
        } else if (typeof data === "string") {
          motivoErro = data;
        }
      }

      setResultado({
        status: "ERRO",
        motivoErro,
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
            maxLength={14} // permite digitar pontos/traços, será normalizado
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
