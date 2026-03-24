import { useState } from "react";
import "./clt.css";

export default function CltResultadoCard({ resultado }) {
    const [openModal, setOpenModal] = useState(false);
    const [propostaDigitada, setPropostaDigitada] = useState(false);

    console.log("Resultado recebido no card:", resultado);

    if (!resultado) return null;

    // aqui ficaria o const que captura os dados da props "resultado"
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
            {/* <Modal
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
            </Modal> */}
          </>
        );
    }

    // oferta inelegível
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