import { useState } from "react";
import "./clt.css";
import Modal from "../../components/Modal";
import CltPropostaV8 from "./CltPropostaV8";
import CltPropostaNossaFintech from "./CltPropostaNossaFintech";

export default function CltResultadoCard({ resultado }) {
    const [openModal, setOpenModal] = useState(false);
    const [propostaDigitada, setPropostaDigitada] = useState(false);
    const [msgRetorno, setMsgRetorno] = useState("");
    const [linkForm, setLinkForm] = useState("");

    

    if (!resultado) return null;

    // aqui ficaria o const que captura os dados da props "resultado"
    const { instituicaoEscolhida } = resultado;

    const {
        status,
        cpf,
        sexo,
        nomeMae,
        tabelaId,
        simulacaoId,
        nomeTabela,
        taxaJurosMensal,
        valorLiberado,
        qtdParcelas,
        motivoErro,
        valorMargemAvaliavel
    } = resultado || {};

    // gambiarra para n quebrar o código com o novo esquema de variáveis para v8 e nossa fintech q fiz
    let cnpjEmpregador = resultado?.cnpjEmpregador || resultado?.cnpj_empregador || "";
    let tabelasElegiveis = [];
    let registroEmpregaticio = "";
    let valorSolicitado = 0;
    let banco = "";
    let profissao = resultado?.profissao || "";
    let margemDisponivel = 0;

    if (instituicaoEscolhida === "v8" && resultado) {
        tabelasElegiveis = resultado.tabelasElegiveis || [];
        registroEmpregaticio = resultado.registroEmpregaticio;
        valorSolicitado = resultado.valorSolicitado;
    } else if (instituicaoEscolhida === "Nossa fintech" && resultado) {
        banco = resultado.banco;
        margemDisponivel = resultado.valorMargemDisponivel;
    }


    const formatarData = (data) => {
        if (!data) return "-";
        return data.split("-").reverse().join("/");
    };

    // Formata números para o padrão BRL (R$ 1.234,56)
    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    };

    let tabelaDestaque = null;

    if (instituicaoEscolhida == "v8" && tabelasElegiveis && tabelasElegiveis.length > 0) {
        const tabela36 = tabelasElegiveis.find(tabela => tabela.prazo === 36);
        tabelaDestaque = tabela36 ? tabela36 : tabelasElegiveis[0];
    }

    // Pega o valor liberado da tabela escolhida, ou 0 se der ruim
    const valorParaReceber = tabelaDestaque ? tabelaDestaque.valorLiberado : 0;

    // ---------- CARD OFERTA DISPONÍVEL V8 -----------
    if (status === "ELEGIVEL" && !propostaDigitada && instituicaoEscolhida == "v8") {
        return (
            <>
                <div className="card oferta">
                    <div className="card-header verde">
                        ✔ Oferta Disponível
                    </div>

                    <div className="card-body">
                        <p>Cliente vai receber:</p>

                        <h1 style={{ color: '#2e7d32' }}>
                            {formatarMoeda(valorLiberado)}
                        </h1>

                        <p>
                            Instituição:{" "}
                            <strong>{instituicaoEscolhida}</strong>
                        </p>

                        <p style={{ marginTop: "15px" }}>
                            Tabela selecionada: <br />

                            <span style={{ fontWeight: '600', color: '#333', fontSize: "14px" }}>
                                {nomeTabela}
                            </span>

                            {/* Linha 2: Valores organizados lado a lado */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
                                <span>
                                    <strong>Liberado:</strong> <span style={{ color: '#2e7d32' }}>{formatarMoeda(valorLiberado)}</span>
                                </span>

                                <span>
                                    <strong>Parcela:</strong> {qtdParcelas}x de {formatarMoeda(valorMargemAvaliavel)}
                                </span>
                            </div>
                        </p>

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
                    <CltPropostaV8
                        instituicao={instituicaoEscolhida}
                        cpf={cpf}
                        sexo={sexo}
                        qtdParcelas={qtdParcelas}
                        valorParcelas={valorMargemAvaliavel}
                        tabelaId={tabelaId}
                        simulacaoId={simulacaoId}
                        nomeTabela={nomeTabela}
                        taxaJurosMensal={taxaJurosMensal}
                        valorSolicitado={valorSolicitado}
                        valorLiberado={valorLiberado}

                        onSuccess={(bodyCallback) => {
                            setMsgRetorno(bodyCallback.msg);
                            setLinkForm(bodyCallback.link_form);
                            setOpenModal(false);
                            setPropostaDigitada(true);
                        }}
                    />
                </Modal>
            </>
        );
    }

    if (status === "ELEGIVEL" && !propostaDigitada && instituicaoEscolhida == "Nossa fintech") {
        return (
            <>
                <div className="card oferta">
                    <div className="card-header verde">
                        ✔ Oferta Disponível
                    </div>

                    <div className="card-body">
                        <p>Cliente vai receber:</p>

                        <h1 style={{ color: '#2e7d32' }}>
                            {formatarMoeda(valorLiberado)}
                        </h1>

                        <p>
                            Instituição:{" "}
                            <strong>{instituicaoEscolhida}</strong>
                        </p>

                        <p style={{ marginTop: "15px" }}>
                            Tabela selecionada: <br />

                            <span style={{ fontWeight: '600', color: '#333', fontSize: "14px" }}>
                                {nomeTabela}
                            </span>

                            {/* Linha 2: Valores organizados lado a lado */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
                                <span>
                                    <strong>Liberado:</strong> <span style={{ color: '#2e7d32' }}>{formatarMoeda(valorLiberado)}</span>
                                </span>

                                <span>
                                    <strong>Parcela:</strong> {qtdParcelas}x de {formatarMoeda(valorMargemAvaliavel)}
                                </span>

                                <span>
                                    <strong>Taxa:</strong> {taxaJurosMensal}%/mês
                                </span>
                            </div>
                        </p>

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
                    <CltPropostaNossaFintech
                        instituicao={instituicaoEscolhida}
                        cpf={cpf}
                        simulacaoId={simulacaoId}
                        banco={banco}
                        cnpjEmpregador={cnpjEmpregador}
                        profissao={profissao}
                        valorParcelas={valorMargemAvaliavel}
                        taxaJurosMensal={taxaJurosMensal}
                        onSuccess={(bodyCallback) => {
                            setMsgRetorno(bodyCallback.msg);
                            setLinkForm(bodyCallback.link_form);
                            setOpenModal(false);
                            setPropostaDigitada(true);
                        }}
                    />
                </Modal>
            </>
        );
    }

    // oferta digitada com sucesso
    if (status === "ELEGIVEL" && propostaDigitada) {
        return (
            <div className="card consumido">
                <div className="card-header cinza">
                    ✔ Proposta Digitada
                </div>
                <div className="card-body">
                    <p>
                        <strong>Mensagem:</strong> <br />
                        {msgRetorno}
                    </p>
                    <br />
                    <p>
                        <strong>Link para formalização da proposta:</strong> <br />
                        {linkForm}
                    </p>

                    <button
                        className="btn-secundario"
                        onClick={() => (window.location.href = "/clt/esteira")}
                    >
                        Ir para Esteira de Propostas
                    </button>
                </div>
            </div>
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
                    {/* Exibe o CNPJ e Profissão para identificar qual vínculo falhou */}
                    {cnpjEmpregador && (
                        <p style={{ fontSize: "14px", marginBottom: "10px", color: "#555" }}>
                            <strong>Empresa (CNPJ):</strong> {cnpjEmpregador} <br />
                            {profissao && <><strong>Profissão:</strong> {profissao} <br /></>}
                            {margemDisponivel && <><strong>Margem disponível para cliente:</strong> {formatarMoeda(margemDisponivel)}</>}
                        </p>
                    )}

                    <p>Motivo do bloqueio:</p>
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