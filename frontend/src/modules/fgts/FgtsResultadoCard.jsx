import { useState } from "react";
import "./fgts.css";

export default function FgtsResultadoCard({ data, cpf, instituicao, onDigitarProposta }) {
  const [showParcelas, setShowParcelas] = useState(false);

  const elegivel = data.elegivelProposta;

  return (
    <div className="resultado-card">

      {/* 🧾 Cabeçalho */}
      <div className="resultado-header">
        <h3>Resultado da Consulta</h3>
        <span className={`status ${elegivel ? "ok" : "erro"}`}>
          {elegivel ? "Elegível para proposta" : "Não elegível"}
        </span>
      </div>

      {/* 💰 Informações principais */}
      <div className="resultado-main">
        <div>
          <span>Instituição: </span>
          <strong>{instituicao}</strong>
        </div>

        <div>
          <span>Valor líquido: </span>
          <strong className="valor">
            R$ {data.valor_liquido?.toFixed(2)}
          </strong>
        </div>
      </div>

      {/* 📆 Parcelas (somente se o usuário quiser ver) */}
      <button
        className="link-btn"
        onClick={() => setShowParcelas(!showParcelas)}
      >
        {showParcelas ? "Ocultar parcelas" : "Ver parcelas FGTS   "}
      </button>

      {showParcelas && (
        <div className="parcelas-box">
          {data.anuidades.map((p, index) => (
            <div key={index} className="parcela-item">
              <span>{p.dueDate}</span>
              <strong>R$ {p.amount.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}

      {/* 🚀 Botão proposta */}
      {elegivel && (
        <button
          className="btn-proposta"
          onClick={() => onDigitarProposta(data, cpf)}
        >
             Digitar proposta
        </button>
      )}

      {/* ❌ Não elegível */}
      {!elegivel && (
        <div className="nao-elegivel">
          {data.mensagem || "Cliente não elegível para este produto."}
        </div>
      )}
    </div>
  );
}
