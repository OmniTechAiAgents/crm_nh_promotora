import React from 'react';

export default function InfoClienteNovaVida({ cliente, sincronizarDadosLemit, userRole, formatar_data }) {
    if (!cliente || Object.keys(cliente).length === 0) {
        return null;
    }

    const { nome, cpf, data_nasc, celular } = cliente;

    const formatDate = (dateString) => {
        if (!dateString) return "Não informada";
        return formatar_data ? formatar_data(dateString) : dateString;
    };

    // Trata celular vindo como Array de objetos [{ ddd, numero }], Array simples ou String
    const renderCelular = () => {
        if (!celular) return "—";

        if (Array.isArray(celular) && celular.length > 0) {
            const tel = celular[0];
            if (typeof tel === 'object' && tel.numero) {
                return tel.ddd ? `(${tel.ddd}) ${tel.numero}` : tel.numero;
            }
            return tel;
        }

        return typeof celular === 'string' ? celular : "—";
    };

    return (
        <div className='infos-cliente-container'>
            
            {/* SEÇÃO 1: Dados Gerais do Nova Vida */}
            <div className="info-card-section full-width">
                <h3 className="section-title">Dados Gerais (Nova Vida)</h3>
                <div className="personal-data-grid">
                    <div className="data-item">
                        <span className="data-label">Nome Completo</span>
                        <span className="data-value highlight">{nome || "—"}</span>
                    </div>

                    <div className="data-item">
                        <span className="data-label">CPF</span>
                        <span className="data-value">{cpf || "—"}</span>
                    </div>

                    <div className="data-item">
                        <span className="data-label">Data de Nascimento</span>
                        <span className="data-value">{formatDate(data_nasc)}</span>
                    </div>

                    <div className="data-item">
                        <span className="data-label">Provedor de Origem</span>
                        <span className="data-value-group">
                            <span className="badge badge-warning">Nova Vida</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* SEÇÃO 2: Telefone */}
            <div className="info-card-section full-width">
                <h3 className="section-title">Telefone de Contato</h3>
                <div className="cards-list">
                    <div className="item-card">
                        <div className="item-main-info">
                            <span className="item-title">{renderCelular()}</span>
                        </div>
                        <span className="item-ranking">#1</span>
                    </div>
                </div>
            </div>

            {/* Botão de Ação do Admin */}
            {userRole === "admin" && (
                <button
                    type='button'
                    className="btn-consultar btn-sincronizar-dados-nv"
                    onClick={() => sincronizarDadosLemit(cpf)}
                >
                    Sincronizar dados com Lemit
                </button>
            )}
        </div>
    );
}