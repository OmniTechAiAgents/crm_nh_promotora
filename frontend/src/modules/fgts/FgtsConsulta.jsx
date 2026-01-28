import { useState } from "react";
import "./fgts.css";

export default function FgtsConsulta() {
  const [instituicao, setInstituicao] = useState("VTEX"); // default
  const [cpf, setCpf] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  async function consultarFGTS() {
    if (cpf.length !== 11) {
      alert("CPF deve conter 11 números.");
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const response = await fetch("http://localhost:3000/consulta-fgts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ instituicao, cpf }),
      });

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      setResultado({ erro: "Erro ao conectar ao servidor." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fgts-container">
      <h2>Consulta FGTS Manual</h2>

      <div className="fgts-form">

        {/* 🔘 Seleção de Instituição */}
        <div className="form-group">
          <label>Instituição para Consulta</label>

          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="instituicao"
                value="VTEX"
                checked={instituicao === "VTEX"}
                onChange={(e) => setInstituicao(e.target.value)}
              />
              VCTeX
            </label>

          </div>
        </div>

        {/* CPF + Botão lado a lado */}
        <div className="form-row">
          <div className="form-group cpf-group">
            <label>CPF</label>
            <input
              value={cpf}
              onChange={(e) =>
                setCpf(e.target.value.replace(/\D/g, ""))
              }
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
      </div>

      {resultado && (
        <div className="resultado-box">
          <h3>Resultado da Consulta</h3>
          <pre>{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
