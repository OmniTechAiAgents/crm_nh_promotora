import { useState } from "react";
import "./clt.css";
import CltProposta from "./CltProposta";
import Modal from "../../components/Modal";

export default function CltResultadoCard({ resultado }) {
    const [openModal, setOpenModal] = useState(false);
    const [propostaDigitada, setPropostaDigitada] = useState(false);

    console.log("Resultado recebido no card:", resultado);

    if (!resultado) return null;

    // aqui ficaria o const que captura os dados da props "resultado"
    const {
        status,
        valorMargemAvaliavel,
        instituicaoEscolhida,
        cnpjEmpregador,
        tabelasElegiveis = [],
        cpf,
        sexo,
        nomeMae,
        registroEmpregaticio,
        motivoErro,

        // parte do v8
        tabelaId,
        simulacaoId,
        nomeTabela,
        taxaJurosMensal,
        valorSolicitado,
        valorLiberado,
        qtdParcelas
    } = resultado;


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

    if (tabelasElegiveis && tabelasElegiveis.length > 0) {
        const tabela36 = tabelasElegiveis.find(tabela => tabela.prazo === 36);
        tabelaDestaque = tabela36 ? tabela36 : tabelasElegiveis[0];
    }

    // Pega o valor liberado da tabela escolhida, ou 0 se der ruim
    const valorParaReceber = tabelaDestaque ? tabelaDestaque.valorLiberado : 0;

    // ---------- CARD OFERTA DISPONÍVEL PRESENÇA ----------
    if (status === "ELEGIVEL" && !propostaDigitada && instituicaoEscolhida == "Presenca bank") {
        return (
            <>
                <div className="card oferta">
                    <div className="card-header verde">
                        ✔ Vínculo Elegível
                    </div>
    
                    <div className="card-body">
                        <p>Cliente vai receber:</p>
    
                        <h1 style={{ color: '#2e7d32' }}>
                            {formatarMoeda(valorParaReceber)}
                        </h1>
    
                        <p>
                            Instituição:{" "}
                            <strong>{instituicaoEscolhida}</strong>
                        </p>

                        <p>
                            CNPJ empregador:{" "}
                            <strong>{cnpjEmpregador}</strong>
                        </p>
    
                        <details className="tabelas-disponiveis-card">
                            <summary style={{ cursor: "pointer" }}>Ver tabelas disponíveis</summary>

                            {tabelasElegiveis && tabelasElegiveis.length > 0 ? (
                                tabelasElegiveis.map((tabela) => (
                                <div 
                                    key={tabela.id_tabela} 
                                    className="linha-parcela" 
                                    style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}
                                >
                                    {/* Linha 1: Nome da Tabela em destaque */}
                                    <span style={{ fontWeight: '600', color: '#333' }}>
                                        {tabela.nome}
                                    </span>
                                    
                                    {/* Linha 2: Valores organizados lado a lado */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
                                        <span>
                                            <strong>Liberado:</strong> <span style={{ color: '#2e7d32' }}>{formatarMoeda(tabela.valorLiberado)}</span>
                                        </span>
                                        
                                        <span>
                                            <strong>Parcela:</strong> {tabela.prazo}x de {formatarMoeda(tabela.valorParcela)}
                                        </span>
                                    </div>
                                </div>
                                ))
                            ) : (
                                <div>Nenhuma tabela disponível</div>
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
                <CltProposta 
                    instituicao={instituicaoEscolhida}
                    cpf={cpf}
                    sexo={sexo}
                    nomeMae={nomeMae}
                    cnpjEmpregador={cnpjEmpregador}
                    registroEmpregaticio={registroEmpregaticio}
                    tabelasDisponíveis={tabelasElegiveis}
                    valorMargemAvaliavel={valorMargemAvaliavel}

                    onSuccess={() => {
                        setOpenModal(false);
                        setPropostaDigitada(true);
                    }}
                />
            </Modal>
          </>
        );
    }

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
                <CltProposta 
                    instituicao={instituicaoEscolhida}
                    cpf={cpf}
                    sexo={sexo}
                    nomeMae={nomeMae}
                    cnpjEmpregador={cnpjEmpregador}
                    registroEmpregaticio={registroEmpregaticio}
                    tabelasDisponíveis={tabelasElegiveis}
                    valorMargemAvaliavel={valorMargemAvaliavel}

                    onSuccess={() => {
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
                        Esta oferta foi utilizada para geração de proposta.
                    </p>

                    <button
                        className="btn-secundario"
                        onClick={() => (alert("Função ainda não implementada..."))}
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