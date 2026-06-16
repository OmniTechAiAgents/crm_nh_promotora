import { useEffect, useState } from "react";
import api from "../../api/client";
import "./clt.css";
import CltResultadoCard from "./CltResultadoCard";

// Função para normalizar o CPF
function normalizarCPF(cpfInput) {
    if (!cpfInput) return "";

    let somenteNumeros = cpfInput.replace(/\D/g, "");

    while (somenteNumeros.length < 11) {
        somenteNumeros = "0" + somenteNumeros;
    }

    if (somenteNumeros.length > 11) {
        somenteNumeros = somenteNumeros.slice(0, 11);
    }

    return somenteNumeros;
}

// Função utilitária para extrair mensagem de erro corretamente
function getErrorMessage(error) {
    const status = error.response?.status;
    const data = error.response?.data?.erro;

    if (status === 401) {
        return "Sessão expirada. Faça login novamente.";
    }

    if (!data) {
        return error.message || "Erro inesperado.";
    }

    if (typeof data === "string") {
        return data;
    }

    return (
        data.message ||
        data.motivo ||
        data.erro ||
        data.mensagem ||
        "Erro ao consultar backend."
    );
}

export default function CltConsulta() {
    const [cpf, setCpf] = useState("");
    const [instituicao, setInstituicao] = useState("v8");
    const [resultado, setResultado] = useState(null);
    const [resultadoSimulacao, setResultadoSimulacao] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingSimulacao, setLoadingSimulacao] = useState(false);
    const [tabelaSelecionada, setTabelaSelecionada] = useState("");
    const [prazoSelecionado, setPrazoSelecionado] = useState("");
    const [tabelasDisponiveis, setTabelasDisponiveis] = useState([]);
    const [prazosDisponiveis, setPrazosDisponiveis] = useState([]);

    // novas variáveis de estado para nossa fintech
    const [bancarizadorasDisponiveisNossaFintech, setBancarizadorasDisponiveisNossaFintech] = useState([]);
    const [bancarizadoraSelecionada, setBancarizadoraSelecionada] = useState("");
    const [loadingBancarizadora, setLoadingBancarizadora] = useState(false);
    const [textoCopiado, setTextoCopiado] = useState(false);
    const [loadingCopy, setLoadingCopy] = useState(false);

    const [tabelaNossaFintechSelecionada, setTabelaNossaFintechSelecionada] = useState(null);
    const [termoSelecionado, setTermoSelecionado] = useState("");
    const [cnpjEmpregador, setCnpjEmpregador] = useState("");
    const [vinculoSelecionado, setVinculoSelecionado] = useState(null);

    const handleChangeBancarizadora = (event) => {
        setBancarizadoraSelecionada(event.target.value);
    };
    const handleGerarTermoAutorizacao = async (cpf, bancarizadora) => {
        try {
            if (!bancarizadoraSelecionada) {
                throw new Error("Selecione uma bancarizadora antes de autorização.");
            }

            const response = await api.post("/consultas/CLT/gerarAutorizacaoDataPrev", {
                cpf,
                instituicao: "Nossa fintech",
                banco: bancarizadoraSelecionada
            });

            return response?.data?.link;
        } catch (err) {
            alert(err.message || "Erro ao gerar termo de autorização.");
        }
    }
    async function copiarTexto(conteudo) {
        try {
            console.log(`conteúdo as ser copiado: ${conteudo}`)

            await navigator.clipboard.writeText(conteudo);
            console.log("Texto copiado com sucesso!");

            setTextoCopiado(true);

            setTimeout(() => {
                setTextoCopiado(false);
            }, 3000);
        } catch (err) {
            alert(`Erro ao copiar! Por favor, selecione e copie o texto manualmente: ${conteudo}`);
            console.error("Falha ao copiar:", err);
        }
    }
    const handleGerarECopiar = async () => {
        if (!bancarizadoraSelecionada) {
            alert("Selecione uma bancarizadora antes de gerar a autorização.");
            return;
        }

        try {
            setLoadingCopy(true);

            const linkGerado = await handleGerarTermoAutorizacao(cpf, bancarizadoraSelecionada);

            if (linkGerado) {
                await copiarTexto(linkGerado);
            }
        } catch (err) {
            console.error("Erro no processo de gerar e copiar:", err);
        } finally {
            setLoadingCopy(false);
        }
    };

    const consultar = async () => {
        setResultado(null);
        setResultadoSimulacao(null);
        setTabelaSelecionada("");

        const cpfNormalizado = normalizarCPF(cpf);

        if (instituicao == "Nossa fintech" && (bancarizadoraSelecionada == "" || !bancarizadoraSelecionada)) {
            alert("Selecione uma bancarizadora antes de consultar.")
            return;
        }

        try {
            setLoading(true);

            const authData = JSON.parse(localStorage.getItem("auth_data"));
            const token = authData?.token;

            // verifica token do usuário
            if (!token) {
                setResultado({
                    status: "ERRO",
                    motivoErro: "Sessão expirada. Faça login novamente."
                });
                return;
            }

            // montando bodys diferentes a depender da instituição
            const bodyV8 = {
                cpf: cpfNormalizado,
                instituicao
            }
            const bodyNossaFintech = {
                cpf: cpfNormalizado,
                instituicao,
                banco: bancarizadoraSelecionada
            }

            let bodyRequisicao;

            if (instituicao === "v8") {
                bodyRequisicao = bodyV8;
            } else if (instituicao === "Nossa fintech") {
                bodyRequisicao = bodyNossaFintech;
            } else {
                bodyRequisicao = "";
            }

            // faz a requisição
            const { data } = await api.post(
                "/consultas/CLT/consultarVinculosMargemTabela",
                bodyRequisicao
            );

            const ofertasTratadas = data.map(vinculo => ({
                status: "ELEGIVEL",
                instituicaoEscolhida: instituicao,

                // mandando o body de retorno direto já que são filtrados no back-end
                ...vinculo
            }));

            // mandando o resultado para o card ainda sem tratar
            setResultado(ofertasTratadas);

            // setando os dados que o v8 precisa para funcionar
            if (instituicao == "v8") {
                const tabelas = ofertasTratadas[0].tabelasElegiveis;
                setTabelasDisponiveis(tabelas);

                // console.log("Tabelas encontradas:", tabelas);
            }


        } catch (err) {
            if (instituicao == "v8") {
                if (err.status === 424) {
                    setResultadoSimulacao({
                        status: "NAO_ELEGIVEL",
                        motivoErro: getErrorMessage(err)
                    });
                } else if (err.status == 422) {
                    alert("API do v8 está esperando para fazer a consulta de saldo, refaça essa requisição daqui a alguns minutos.")
                    setResultadoSimulacao(null);
                } else {
                    setResultadoSimulacao({
                        status: "ERRO",
                        motivoErro: getErrorMessage(err)
                    });
                }
            } else if (instituicao == "Nossa fintech") {
                if (err.status === 424) {
                    setResultadoSimulacao({
                        status: "NAO_ELEGIVEL",
                        motivoErro: getErrorMessage(err)
                    });
                }
            }
            else {
                console.log("Deu alguma merda...");
            }
        } finally {
            setLoading(false);
        }
    };
    const gerarSimulacao = async () => {
        setResultadoSimulacao(null);

        try {
            setLoadingSimulacao(true);

            const authData = JSON.parse(localStorage.getItem("auth_data"));
            const token = authData?.token;

            // verifica token do usuário
            if (!token) {
                setResultado({
                    status: "ERRO",
                    motivoErro: "Sessão expirada. Faça login novamente."
                });
                return;
            }

            // colocando validaçao rápida
            if (instituicao == "v8" && (!resultado[0].idTermo || !tabelaSelecionada || !resultado[0].valorMargemAvaliavel || !prazoSelecionado)) {
                throw new Error("O v8 não retornou alguma informação necessária para prosseguir.")
            }

            const bodyV8 = ({
                instituicao,
                idTermo: resultado[0].idTermo,
                tabelaId: tabelaSelecionada,
                valorParcelas: resultado[0].valorMargemAvaliavel,
                qtdParcelas: parseInt(prazoSelecionado)
            })

            const bodyNossaFintech = ({
                instituicao,
                idTermo: vinculoSelecionado.idTermo,
                cnpj_empregador: vinculoSelecionado.cnpjEmpregador,
                banco: bancarizadoraSelecionada,
                tabelaId: tabelaNossaFintechSelecionada.cod_tabela,
                valorParcelas: parseFloat(vinculoSelecionado.valorMargemAvaliavel)
            })

            console.log("BODY ENVIADO PARA O BGL DE SIMULAR:")
            console.log(bodyNossaFintech);

            let bodySimulacao;
            if (instituicao === "v8") {
                bodySimulacao = bodyV8;
            } else if (instituicao === "Nossa fintech") {
                bodySimulacao = bodyNossaFintech;
            } else {
                bodySimulacao = "";
            }

            const { data } = await api.post(
                "/propostas/CLT/simular",
                bodySimulacao
            );

            let ofertasTratadas;

            if (instituicao == "v8") {
                ofertasTratadas = ({
                    status: "ELEGIVEL",
                    instituicaoEscolhida: instituicao,
                    valorMargemAvaliavel: data.valor_parcelas,
                    cpf: resultado[0].cpf,
                    sexo: resultado[0].sexo,
                    nomeMae: resultado[0].nomeMae,

                    // parte do v8 em si
                    tabelaId: data.id_tabela,
                    simulacaoId: data.id_simulacao,
                    nomeTabela: data.nome_tabela,
                    taxaJurosMensal: data.taxa_juros_mensal,
                    valorSolicitado: data.valor_solicitado,
                    valorLiberado: data.valor_liberado,
                    qtdParcelas: data.qtd_parcelas
                });
            } else if(instituicao == "Nossa fintech") {
                ofertasTratadas = ({
                    status: "ELEGIVEL",
                    instituicaoEscolhida: instituicao,
                    valorMargemAvaliavel: data.valor_parcelas,
                    cpf: resultado[0].cpf,
                    sexo: resultado[0].sexo,
                    nomeMae: resultado[0].nomeMae,
                    banco: bancarizadoraSelecionada,
                    cnpj_empregador: cnpjEmpregador,
                    profissao: vinculoSelecionado.profissao,

                    tabelaId:tabelaNossaFintechSelecionada.cod_tabela,
                    simulacaoId: data.id_simulacao,
                    nomeTabela: tabelaNossaFintechSelecionada.name,
                    taxaJurosMensal: data.taxa_aplicada,
                    valorLiberado: data.valor_total,
                    qtdParcelas: data.qtd_parcelas
                });
            }
            
            // console.log(ofertasTratadas)
            setResultadoSimulacao(ofertasTratadas)
        } catch (err) {
            // captura uma possível proposta inelegível
            if (err.status === 424) {
                setResultadoSimulacao({
                    status: "NAO_ELEGIVEL",
                    motivoErro: getErrorMessage(err)
                });
            } else {
                setResultadoSimulacao({
                    status: "ERRO",
                    motivoErro: getErrorMessage(err)
                });
            }
        } finally {
            setLoadingSimulacao(false);
        }
    }
    const recuperarBancarizadorasNossaFintech = async () => {
        try {
            setLoadingBancarizadora(true);

            const { data } = await api.get("/consultas/CLT/bancarizadoras?instituicao=Nossa fintech");

            console.log("BANCARIZARODAS RECUPERADAS");
            console.log(data.bancarizadoras_disponiveis)

            return data.bancarizadoras_disponiveis;
        } catch (err) {
            alert(`Erro ao recuperar bancarizadoras da Nossa Fintech: ${getErrorMessage(err)}`);
        } finally {
            setLoadingBancarizadora(false);
        }
    }

    const handleChangeTabelaSelecionada = (event) => {
        setTabelaSelecionada(event.target.value);
    };

    const handleChangePrazoSelecionado = (event) => {
        setPrazoSelecionado(event.target.value);
    };

    const handleVinculoChange = (e) => {
        const termoId = e.target.value;

        if (!termoId) {
            setVinculoSelecionado(null);
            setTermoSelecionado("");
            setCnpjEmpregador("");
            setTabelaNossaFintechSelecionada("");
            return;
        }

        const vinculoEncontrado = resultado.find(v => v.idTermo === termoId);

        if (vinculoEncontrado) {
            setVinculoSelecionado(vinculoEncontrado);
            setTermoSelecionado(vinculoEncontrado.idTermo);
            setCnpjEmpregador(vinculoEncontrado.cnpjEmpregador);

            setTabelaNossaFintechSelecionada("");
        }
    };

    const handleTabelaChange = (e) => {
        const codTabelaId = e.target.value;

        if (!codTabelaId) {
            setTabelaNossaFintechSelecionada(null);
            return;
        }

        // Procura o objeto da tabela dentro do vínculo que já está selecionado
        const tabelaEncontrada = vinculoSelecionado?.tabelasElegiveis?.find(
            (t) => t.cod_tabela === codTabelaId
        );

        if (tabelaEncontrada) {
            setTabelaNossaFintechSelecionada(tabelaEncontrada);
        }
    };

    const limparResultado = () => {
        setResultado(null)
    }

    useEffect(() => {
        if (tabelaSelecionada && tabelasDisponiveis.length > 0) {
            const tabela = tabelasDisponiveis.find(t => t.id === tabelaSelecionada);

            if (tabela && tabela.number_of_installments) {
                const parcelas = tabela.number_of_installments;

                setPrazosDisponiveis(parcelas);

                const maiorParcela = Math.max(...parcelas.map(p => Number(p)));

                setPrazoSelecionado(maiorParcela.toString());
            }
        } else {
            setPrazosDisponiveis([]);
            setPrazoSelecionado("");
        }
    }, [tabelaSelecionada, tabelasDisponiveis]);

    useEffect(() => {
        const carregarBancarizadoras = async () => {
            const bancarizadorasDisponiveis = await recuperarBancarizadorasNossaFintech();

            if (bancarizadorasDisponiveis) {
                setBancarizadorasDisponiveisNossaFintech(bancarizadorasDisponiveis);
            }
        };

        carregarBancarizadoras();
    }, []);

    return (
        <div className="consulta-container-clt">
            <h2>Consulta & Proposta CLT</h2>

            {/* CPF + BOTÃO */}
            <div className="consulta-form">
                <div className="input-group">
                    <label>CPF</label>
                    <input
                        placeholder="Digite o CPF"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        maxLength={14}
                    />
                </div>

                {instituicao == "v8" ? (
                    <button
                        className="btn-consultar"
                        onClick={consultar}
                        disabled={loading}
                    >
                        {loading ? "Consultando..." : "Consultar"}
                    </button>
                ) : ("")}
            </div>

            {/* Selects V8 */}
            {instituicao === "v8" && (
                <div className="consulta-form">
                    <select
                        value={tabelaSelecionada}
                        onChange={handleChangeTabelaSelecionada}
                        className="input-group"
                        disabled={loading || tabelasDisponiveis.length == 0}
                    >
                        {tabelasDisponiveis.length == 0 ? (
                            <option value="">{loading ? "Carregando..." : "Realize a consulta"}</option>
                        ) : (
                            <>
                                <option value="">Selecione a tabela</option>
                                {tabelasDisponiveis.map((tabela) => (
                                    <option key={tabela.id} value={tabela.id}>
                                        {tabela.slug}
                                    </option>
                                ))}
                            </>
                        )}

                    </select>

                    <select
                        value={prazoSelecionado}
                        onChange={handleChangePrazoSelecionado}
                        className="input-group"
                        disabled={!tabelaSelecionada || prazosDisponiveis.length === 0}
                    >
                        {prazosDisponiveis.length === 0 ? (
                            <option value="">Aguardando tabela...</option>
                        ) : (
                            <>
                                <option value="">Selecione o prazo</option>

                                {prazosDisponiveis.map((prazo) => (
                                    <option key={prazo} value={prazo}>
                                        {prazo}x
                                    </option>
                                ))}
                            </>
                        )}
                    </select>

                    <button
                        className="btn-consultar"
                        disabled={resultado == null || loadingSimulacao}
                        onClick={gerarSimulacao}
                    >
                        {loadingSimulacao ? "Carregando..." : "Simular"}
                    </button>
                </div>
            )}

            {/* Selects Nossa fintech */}
            {instituicao === "Nossa fintech" && (
                <>
                    <div className="consulta-form">
                        <select
                            value={bancarizadoraSelecionada}
                            onChange={handleChangeBancarizadora}
                            className="input-group"
                            disabled={loadingBancarizadora}
                        >
                            {loadingBancarizadora ? (
                                <option value="">Carregando bancarizadoras...</option>
                            ) : (
                                <>
                                    <option value="">Selecione a bancarizadora</option>
                                    {bancarizadorasDisponiveisNossaFintech.map((bancarizadora) => (
                                        <option key={bancarizadora} value={bancarizadora}>
                                            {bancarizadora}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>

                        <button
                            className="btn-consultar"
                            disabled={!bancarizadoraSelecionada || loadingCopy}
                            onClick={handleGerarECopiar}
                        >
                            {loadingCopy ? (
                                "Copiando..."
                            ) : textoCopiado ? (
                                "Copiado!"
                            ) : (
                                "Gerar termo de autorização"
                            )}
                        </button>

                        <button
                            className="btn-consultar"
                            onClick={consultar}
                            disabled={loading}
                        >
                            {loading ? "Consultando..." : "Consultar vinculo, margem e tabelas"}
                        </button>
                    </div>

                    <div className="consulta-form">
                        {/* 2° select para a tabela */}
                        {resultado != null && resultado.length > 0 ? (
                            <>
                                {/* 1° Select: Vínculos Disponíveis */}
                                <div className="select-container">
                                    <select
                                        value={termoSelecionado} // Controlado pelo idTermo
                                        onChange={handleVinculoChange}
                                        className="input-group"
                                    >
                                        <option value="">Selecione o vínculo</option>
                                        {resultado.map((vinculo) => (
                                            <option key={vinculo.idTermo} value={vinculo.idTermo}>
                                                CNPJ: {vinculo.cnpjEmpregador} - {vinculo.profissao || "Não informada"}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 2° Select: Tabelas (Só aparece ou fica ativo se um vínculo for selecionado antes) */}
                                <div className="select-container">
                                    <select
                                        value={tabelaNossaFintechSelecionada?.cod_tabela || ""} // Controlado pelo cod_tabela
                                        onChange={handleTabelaChange}
                                        className="input-group"
                                        disabled={!vinculoSelecionado} // Fica desativado se não escolheu o vínculo
                                    >
                                        <option value="">
                                            {vinculoSelecionado ? "Selecione a tabela" : "Escolha um vínculo primeiro"}
                                        </option>

                                        {/* Aqui está a mágica: mapeia as tabelas apenas do vínculo que está salvo no estado */}
                                        {vinculoSelecionado?.tabelasElegiveis?.map((tabela) => (
                                            <option key={tabela.cod_tabela} value={tabela.cod_tabela}>
                                                {tabela.name} - {tabela.number_of_installments}x ({tabela.complement})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    className="btn-consultar"
                                    disabled={resultado == null || loadingSimulacao}
                                    onClick={gerarSimulacao}
                                >
                                    {loadingSimulacao ? "Carregando..." : "Simular"}
                                </button>
                            </>
                        ) : ("")}
                    </div>
                </>
            )}

            {/* INSTITUIÇÕES */}
            <div className="instituicoes">
                <span className="inst-title">Instituição:</span>

                <label className="radio-option">
                    <input
                        type="radio"
                        value="v8"
                        checked={instituicao === "v8"}
                        onChange={(e) => {
                            setInstituicao(e.target.value)
                            limparResultado()
                        }}
                    />
                    v8
                </label>
                <label className="radio-option">
                    <input
                        type="radio"
                        value="Nossa fintech"
                        checked={instituicao === "Nossa fintech"}
                        onChange={(e) => {
                            setInstituicao(e.target.value)
                            limparResultado()
                        }}
                    />
                    Nossa fintech
                </label>
            </div>

            {/* RESULTADO */}
            <div className="result-vinculos">
                <h2>Ofertas disponíveis</h2>

                <div className="div-cards-result">
                    {resultadoSimulacao && Array.isArray(resultadoSimulacao) ? (
                        resultadoSimulacao.map((item) => (
                            <CltResultadoCard key={item.matricula} resultado={item} />
                        ))
                    ) : (
                        resultadoSimulacao && <CltResultadoCard resultado={resultadoSimulacao} />
                    )}
                </div>
            </div>
        </div>
    );
}