import { useState } from "react";
import FgtsResultadoCard from "./FgtsResultadoCard";
import "./fgts.css";

export default function FgtsConsulta() {
  const [instituicao, setInstituicao] = useState("VCTEX");
  const [cpf, setCpf] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔐 pega token salvo no login
  const authData = JSON.parse(localStorage.getItem("auth_data"));
  const token = authData?.token;

  async function consultarFGTS() {
    if (cpf.length !== 11) {
      alert("CPF deve conter 11 números.");
      return;
    }

    setLoading(true);
    setResultado(null);

    try { 
      console.log(JSON.stringify({ instituicao, cpf }));
      const response = await fetch(
        "http://localhost:3000/consultas/FGTS/manual",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ instituicao, cpf }),
        }
      );

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      setResultado({ erro: "Erro ao conectar ao servidor." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="consulta-container">
      <h2>Consulta FGTS Manual</h2>

      {/* 🔹 LINHA CPF + BOTÃO */}
      <div className="consulta-form">
        <div className="input-group">
          <label>CPF</label>
          <input
            value={cpf}
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
            placeholder="Somente números"
            maxLength={11}
          />
        </div>

        <button
          className="btn-consultar"
          onClick={consultarFGTS}
          disabled={loading}
        >
          {loading ? "Consultando..." : "Consultar"}
        </button>
      </div>

      {/* 🔹 INSTITUIÇÕES */}
      <div className="instituicoes">
        <span className="inst-title">Instituição:</span>

        <label className="radio-option">
          <input
            type="radio"
            name="instituicao"
            value="VCTex"
            checked={instituicao === "VCTex"}
            onChange={(e) => setInstituicao(e.target.value)}
          />
          <span>VCTEX</span>
        </label>

        <label className="radio-option">
          <input
            type="radio"
            name="instituicao"
            value="Nossa Fintech"
            checked={instituicao === "Nossa Fintech"}
            onChange={(e) => setInstituicao(e.target.value)}
          />
          <span>Nossa Fintech</span>
        </label>
      </div>

      {/* 🔹 RESULTADO COMERCIAL (não JSON cru) */}
      {resultado && !resultado.erro && (
        <FgtsResultadoCard
          data={resultado}
          cpf={cpf}
          instituicao={instituicao}
          onDigitarProposta={(data, cpf) => {
            console.log("Abrir modal proposta", data, cpf);
          }}
        />
      )}

      {/* 🔹 ERRO */}
      {resultado?.erro && (
        <div className="resultado-box erro">
          {resultado.erro}
        </div>
      )}
    </div>
  );
}
