import "./fgts.css";

export default function FgtsResultadoCard({ resultado }) {
  if (!resultado) return null;

  const {
    status,
    valorLiquido,
    instituicaoEscolhida,
    anuidades = [], // ✅ evita undefined
    cpf,
    motivoErro,
  } = resultado;

  // ---------- CARD OFERTA DISPONÍVEL ----------
  if (status === "ELEGIVEL") {
    return (
      <div className="card oferta">
        <div className="card-header verde">✔ Oferta Disponível</div>

        <div className="card-body">
          <p>Cliente vai receber:</p>
          <h1>R$ {Number(valorLiquido || 0).toFixed(2)}</h1>

          <p>
            Instituição: <strong>{instituicaoEscolhida}</strong>
          </p>

          <details>
            <summary>Ver parcelas do FGTS</summary>

            {anuidades.length > 0 ? (
              anuidades.map((a, i) => {
                const ano =
                  a.ano ??
                  a.anoReferencia ??
                  a.ano_referencia ??
                  a.parcela ??
                  i + 1;

                const valor =
                  a.valor ??
                  a.valorParcela ??
                  a.valor_parcela ??
                  a.valorDisponivel ??
                  a.valor_disponivel ??
                  0;

                return (
                  <div key={i} className="linha-parcela">
                    <span>Ano {ano}</span>
                    <span>R$ {Number(valor).toFixed(2)}</span>
                  </div>
                );
              })
            ) : (
              <div>Nenhuma anuidade disponível</div>
            )}
          </details>

          <button className="btn-principal">Digitar Proposta</button>
        </div>
      </div>
    );
  }

  // ---------- CARD NÃO ELEGÍVEL ----------
  if (status === "NAO_ELEGIVEL") {
    return (
      <div className="card erro">
        <div className="card-header vermelho">⚠ Não Elegível</div>
        <div className="card-body">
          <p>Motivo:</p>
          <strong>{motivoErro || "Saldo insuficiente ou restrição."}</strong>
        </div>
      </div>
    );
  }

  // ---------- CARD PROPOSTA JÁ EXISTE ----------
  if (status === "PROPOSTA_EXISTENTE") {
    return (
      <div className="card proposta">
        <div className="card-header cinza">📝 Proposta Já Digitada</div>
        <div className="card-body">
          <p>Status: Proposta já registrada</p>
          <p>CPF: {cpf}</p>
          <button className="btn-secundario" disabled>
            Proposta Enviada
          </button>
        </div>
      </div>
    );
  }

  // ---------- ERRO TÉCNICO ----------
  return (
    <div className="card erro">
      <div className="card-header vermelho">Erro</div>
      <div className="card-body">
        {motivoErro || "Erro inesperado na consulta."}
      </div>
    </div>
  );
}
