import { useState } from "react";
import "./fgts.css";

export default function FgtsResultadoCard({ resultado, instituicao }) {

  if (!resultado) return null;
  
  const [showParcelas, setShowParcelas] = useState(false);

  const {
    elegivelProposta,
    valor_liquido,
    valor_bruto,
    anuidades,
    mensagem,
  } = resultado;

  // 🧾 Formatação moeda
  const formatMoney = (v) =>
    Number(v).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  if (!elegivelProposta) {
    return (
      <div className="fgts-card error">
        <h3>Cliente não elegível</h3>
        <p>{mensagem || "Sem oferta disponível para este CPF."}</p>
      </div>
    );
  }

  return (
    <div className="fgts-card success">

      {/* CABEÇALHO */}
      <div className="fgts-card-header">
        <h3>Oferta Disponível</h3>
        <span className="badge">{instituicao}</span>
      </div>

      {/* VALOR PRINCIPAL */}
      <div className="fgts-main-value">
        <span>Cliente recebe</span>
        <strong>{formatMoney(valor_liquido)}</strong>
      </div>

      {/* INFO SECUNDÁRIA */}
      <div className="fgts-secondary">
        <div>
          <span>Valor Bruto</span>
          <strong>{formatMoney(valor_bruto)}</strong>
        </div>
      </div>

      {/* AÇÕES */}
      <div className="fgts-actions">
        <button
          className="btn-detalhes"
          onClick={() => setShowParcelas(!showParcelas)}
        >
          {showParcelas ? "Ocultar parcelas" : "Ver parcelas FGTS"}
        </button>

        <button className="btn-proposta">
          Digitar proposta
        </button>
      </div>

      {/* PARCELAS */}
      {showParcelas && (
        <div className="parcelas-box">
          {anuidades.map((a, i) => (
            <div key={i} className="parcela-item">
              <span>{new Date(a.dueDate).toLocaleDateString("pt-BR")}</span>
              <strong>{formatMoney(a.amount)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
