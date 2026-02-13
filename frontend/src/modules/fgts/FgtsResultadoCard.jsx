import { useState } from "react";
import "./fgts.css";
import FgtsProposta from "./FgtsProposta";
import Modal from "../../components/Modal";

export default function FgtsResultadoCard({ resultado }) {
  const [openModal, setOpenModal] = useState(false);
  const [propostaDigitada, setPropostaDigitada] = useState(false);

  console.log("Resultado recebido no card:", resultado);

  if (!resultado) return null;

  const {
    status,
    valorLiquido,
    instituicaoEscolhida,
    anuidades = [],
    cpf,
    motivoErro,
    financialId,
  } = resultado;

  const formatarData = (data) => {
    if (!data) return "-";
    return data.split("-").reverse().join("/");
  };

  // ---------- CARD OFERTA DISPONÍVEL ----------
  if (status === "ELEGIVEL" && !propostaDigitada) {
    return (
      <>
        <div className="card oferta">
          <div className="card-header verde">
            ✔ Oferta Disponível
          </div>

          <div className="card-body">
            <p>Cliente vai receber:</p>

            <h1>
              R$ {Number(valorLiquido || 0).toFixed(2)}
            </h1>

            <p>
              Instituição:{" "}
              <strong>{instituicaoEscolhida}</strong>
            </p>

            <details>
              <summary>Ver parcelas do FGTS</summary>

              {anuidades.length > 0 ? (
                anuidades.map((a, i) => (
                  <div key={i} className="linha-parcela">
                    <span>{formatarData(a.dueDate)}</span>
                    <span>
                      R$ {Number(a.amount || 0).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div>Nenhuma anuidade disponível</div>
              )}
            </details>

            <button
              className="btn-principal"
              onClick={() => setOpenModal(true)}
            >
              Digitar Proposta
            </button>
          </div>
        </div>

        {/* ---------- MODAL ---------- */}
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
        >
          <FgtsProposta
            financialId={financialId}
            cpf={cpf}
            instituicao={instituicaoEscolhida}
            onSuccess={() => {
              setOpenModal(false);
              setPropostaDigitada(true);
            }}
          />
        </Modal>
      </>
    );
  }

  // ---------- OFERTA CONSUMIDA ----------
  if (status === "ELEGIVEL" && propostaDigitada) {
    return (
      <div className="card consumido">
        <div className="card-header cinza">
          ✔ Proposta Digitada
        </div>

        <div className="card-body">
          <p>
            Esta oferta foi utilizada para geração de proposta.
          </p>

          <button
            className="btn-secundario"
            onClick={() => (window.location.href = "/esteira-propostas")}
          >
            Ir para Esteira de Propostas
          </button>
        </div>
      </div>
    );
  }

  // ---------- CARD NÃO ELEGÍVEL ----------
  if (status === "NAO_ELEGIVEL") {
    return (
      <div className="card erro">
        <div className="card-header vermelho">
          ⚠ Não Elegível
        </div>
        <div className="card-body">
          <p>Motivo:</p>
          <strong>
            {motivoErro || "Saldo insuficiente ou restrição."}
          </strong>
        </div>
      </div>
    );
  }

  // ---------- PROPOSTA JÁ EXISTENTE ----------
  if (status === "PROPOSTA_EXISTENTE") {
    return (
      <div className="card alerta">
        <div className="card-header amarelo">
          ℹ Proposta já existente
        </div>
        <div className="card-body">
          <p>Já existe uma proposta ativa para este CPF.</p>
        </div>
      </div>
    );
  }

  // ---------- ERRO GENÉRICO ----------
  return (
    <div className="card erro">
      <div className="card-header vermelho">
        Erro
      </div>
      <div className="card-body">
        {motivoErro || "Erro inesperado na consulta."}
      </div>
    </div>
  );
}
