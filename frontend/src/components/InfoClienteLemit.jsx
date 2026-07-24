import React from 'react';

export default function InfoClienteLemit({ cliente, sincronizarDadosLemit, userRole, formatar_data }) {
    if (!cliente || Object.keys(cliente).length === 0) {
        return null;
    }

    const {
        nome,
        cpf,
        data_nasc,
        celular = [],
        sexo,
        nome_mae,
        falecido,
        situacao_cpf,
        renda,
        ocupacao,
        emails = [],
        enderecos = [],
        carros = [],
        vinculos = [],
        risco_credito = {},
        participacao_societaria = [],
    } = cliente;

    const formatDate = (dateString) => {
        if (!dateString) return "Não informada";
        return formatar_data ? formatar_data(dateString) : dateString;
    };

    const formatMoney = (value) => {
        if (!value) return "Não informada";
        const val = typeof value === 'number' ? value : parseFloat(value);
        return isNaN(val) ? value : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatCEP = (cep) => {
        if (!cep) return '';
        const clean = cep.toString().replace(/\D/g, '');
        return clean.length === 8 ? `${clean.slice(0, 5)}-${clean.slice(5)}` : cep;
    };

    return (
        <div className='infos-cliente-container'>
            
            {/* SEÇÃO 1: Dados Pessoais Principais */}
            <div className="info-card-section full-width">
                <h3 className="section-title">Dados Gerais (Lemit)</h3>
                <div className="personal-data-grid">
                    <div className="data-item">
                        <span className="data-label">Nome Completo</span>
                        <span className="data-value highlight">{nome || "—"}</span>
                    </div>

                    <div className="data-item">
                        <span className="data-label">CPF</span>
                        <div className="data-value-group">
                            <span className="data-value">{cpf || "—"}</span>
                            {situacao_cpf && (
                                <span className={`badge ${situacao_cpf.toUpperCase() === 'REGULAR' ? 'badge-success' : 'badge-danger'}`}>
                                    {situacao_cpf}
                                </span>
                            )}
                            {falecido && <span className="badge badge-dark">Falecido</span>}
                        </div>
                    </div>

                    <div className="data-item">
                        <span className="data-label">Data de Nascimento</span>
                        <span className="data-value">{formatDate(data_nasc)}</span>
                    </div>

                    <div className="data-item">
                        <span className="data-label">Sexo</span>
                        <span className="data-value">{sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Feminino' : sexo || "—"}</span>
                    </div>

                    <div className="data-item">
                        <span className="data-label">Nome da Mãe</span>
                        <span className="data-value">{nome_mae || "—"}</span>
                    </div>

                    <div className="data-item">
                        <span className="data-label">Ocupação</span>
                        <span className="data-value">{ocupacao || "—"}</span>
                    </div>

                    <div className="data-item">
                        <span className="data-label">Renda Estimada</span>
                        <span className="data-value">{formatMoney(renda)}</span>
                    </div>

                    <div className="data-item">
                        <span className="data-label">Risco de Crédito (Score)</span>
                        <span className="data-value-group">
                            {risco_credito?.score_credito ? (
                                <span className={`badge ${risco_credito.score_credito === 'BAIXO' ? 'badge-success' : 'badge-warning'}`}>
                                    Score: {risco_credito.score_credito}
                                </span>
                            ) : "—"}
                        </span>
                    </div>
                </div>
            </div>

            {/* SEÇÃO 2: Telefones e E-mails */}
            <div className="info-card-section">
                <h3 className="section-title">Telefones ({celular.length})</h3>
                {celular.length > 0 ? (
                    <div className="cards-list">
                        {celular.map((tel, index) => (
                            <div className="item-card" key={`celular-${index}`}>
                                <div className="item-main-info">
                                    <span className="item-title">({tel.ddd}) {tel.numero}</span>
                                    <div className="badges-group">
                                        {tel.whatsapp && <span className="badge badge-whatsapp">WhatsApp</span>}
                                        {tel.plus && <span className="badge badge-plus">Plus</span>}
                                    </div>
                                </div>
                                <span className="item-ranking">#{tel.ranking || index + 1}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">Nenhum telefone encontrado</p>
                )}
            </div>

            <div className="info-card-section">
                <h3 className="section-title">E-mails ({emails.length})</h3>
                {emails.length > 0 ? (
                    <div className="cards-list">
                        {emails.map((item, index) => (
                            <div className="item-card" key={`email-${index}`}>
                                <div className="item-main-info">
                                    <span className="item-title">{item.email}</span>
                                    {item.possui_cookie && <span className="badge badge-cookie">Cookie Ativo</span>}
                                </div>
                                <span className="item-ranking">#{item.ranking || index + 1}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">Nenhum e-mail encontrado</p>
                )}
            </div>

            {/* SEÇÃO 3: Endereços */}
            <div className="info-card-section full-width">
                <h3 className="section-title">Endereços ({enderecos.length})</h3>
                {enderecos.length > 0 ? (
                    <div className="addresses-grid">
                        {enderecos.map((end, index) => {
                            const rua = [end.tipo_logradouro, end.titulo_logradouro, end.logradouro || end.endereco]
                                .filter(Boolean).join(' ');
                            return (
                                <div className="address-card" key={`endereco-${index}`}>
                                    <div className="address-header">
                                        <span className="badge badge-type">{end.tipo || "Residencial"}</span>
                                        <span className="item-ranking">#{end.ranking || index + 1}</span>
                                    </div>
                                    <p className="address-street">{rua || "Endereço não especificado"}, Nº {end.numero || "S/N"}</p>
                                    {end.complemento && <p className="address-complement">Comp: {end.complemento}</p>}
                                    <p className="address-sub">{end.bairro} — {end.cidade}/{end.uf}</p>
                                    <p className="address-cep">CEP: {formatCEP(end.cep)}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="no-data">Nenhum endereço encontrado</p>
                )}
            </div>

            {/* SEÇÃO 4: Vínculos */}
            <div className="info-card-section">
                <h3 className="section-title">Vínculos Pessoais ({vinculos.length})</h3>
                {vinculos.length > 0 ? (
                    <div className="cards-list">
                        {vinculos.map((v, index) => (
                            <div className="item-card" key={`vinculo-${index}`}>
                                <div className="item-main-info">
                                    <span className="item-title">{v.nome_vinculo}</span>
                                    <span className="item-subtitle">CPF: {v.cpf_vinculo || "—"}</span>
                                </div>
                                <span className="badge badge-relationship">{v.tipo_vinculo}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">Nenhum vínculo encontrado</p>
                )}
            </div>

            {/* SEÇÃO 5: Participação Societária e Carros */}
            <div className="info-card-section">
                <h3 className="section-title">Participação Societária ({participacao_societaria.length})</h3>
                {participacao_societaria.length > 0 ? (
                    <div className="cards-list">
                        {participacao_societaria.map((socio, index) => (
                            <div className="company-card" key={`socio-${index}`}>
                                <div className="company-header">
                                    <span className="item-title">{socio.nome}</span>
                                    <span className={`badge ${socio.situacao_cadastral === 'ATIVA' ? 'badge-success' : 'badge-danger'}`}>
                                        {socio.situacao_cadastral}
                                    </span>
                                </div>
                                <div className="company-details">
                                    <span>CNPJ: {socio.cnpj}</span>
                                    <span>Part.: <strong>{socio.participacao_socio}%</strong></span>
                                    <span>Cap. Social: {formatMoney(socio.capital_social)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">Nenhuma participação societária</p>
                )}
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