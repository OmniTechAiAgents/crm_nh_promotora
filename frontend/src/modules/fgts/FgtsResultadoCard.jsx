import { useState } from "react";
import "./fgts.css";
import FgtsProposta from "./FgtsProposta";
import Modal from "../../components/Modal";

export default function FgtsResultadoCard({ resultado }) {
  const [openModal, setOpenModal] = useState(false);

  if (!resultado) return null;

  // 🔁 NORMALIZAÇÃO SEGURA DO BACKEND
  const normalizado = (() => {
    // Caso backend retorne erro ou algo inesperado
    if (resultado.elegivelProposta === undefined) {
      return {
        status: "ERRO",
        motivoErro: resultado.mensagem || "Resposta inválida do servidor",
      };
    }

    if (resultado.elegivelProposta === true) {
      return {
        status: "ELEGIVEL",
        cpf: resultado.cpf,
        valorLiquido: resultado.valor_liquido,
        anuidades: resultado.anuidades || [],
        chave: resultado.chave, // 🔑 financialId REAL
        instituicaoEscolhida: resultado.banco,
      };
    }

    // elegivelProposta === false
    return {
      status: "NAO_ELEGIVEL",
      cpf: resultado.cpf,
      motivoErro:
        resultado.mensagem || "Saldo insuficiente ou restrição.",
    };
  })();

  const {
    status,
    valorLiquido,
    instituicaoEscolhida,
    anuidades = [],
    cpf,
    motivoErro,
    chave,
  } = normalizado;

  const formatarData = (data) =>
    data.split("-").reverse().join("/");

  // ---------- CARD OFERTA DISPONÍVEL ----------
  if (status === "ELEGIVEL") {
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
                      R$ {Number(a.amount).toFixed(2)}
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
            financialId={chave}
            onSuccess={() => setOpenModal(false)}
          />
        </Modal>
      </>
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
          <strong>{motivoErro}</strong>
        </div>
      </div>
    );
  }

  // ---------- ERRO GENÉRICO ----------
  return (
    <div className="card erro">
      <div className="card-header vermelho">Erro</div>
      <div className="card-body">
        {motivoErro || "Erro inesperado na consulta."}
      </div>
    </div>
  );
}
