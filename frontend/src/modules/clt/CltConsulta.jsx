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
    const [instituicao, setInstituicao] = useState("Presenca bank");
    const [resultado, setResultado] = useState(null);
    const [resultadoSimulacao, setResultadoSimulacao] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingSimulacao, setLoadingSimulacao] = useState(false);
    const [loadingDP, setLoadingDP] = useState(false);
    const [textoCopiado, setTextoCopiado] = useState(false);
    const [tabelaSelecionada, setTabelaSelecionada] = useState("");
    const [prazoSelecionado, setPrazoSelecionado] = useState("");
    const [tabelasDisponiveis, setTabelasDisponiveis] = useState([]);
    const [prazosDisponiveis, setPrazosDisponiveis] = useState([])

    const consultar = async () => {
        setResultado(null);
        setResultadoSimulacao(null);
        setTabelaSelecionada("");

        const cpfNormalizado = normalizarCPF(cpf);

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

            // faz a requisição
            const { data } = await api.post(
                "/consultas/CLT/consultarVinculosMargemTabela",
                {
                    cpf: cpfNormalizado,
                    instituicao
                }
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
            // captura uma possível proposta inelegível
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
            } else if (instituicao == "Presenca bank") {
                if (err.status === 424) {
                    setResultado({
                        status: "NAO_ELEGIVEL",
                        motivoErro: getErrorMessage(err)
                    });
                } else {
                    setResultado({
                        status: "ERRO",
                        motivoErro: getErrorMessage(err)
                    });
                }
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
            if (!resultado[0].idTermo || !tabelaSelecionada || !resultado[0].valorMargemAvaliavel || !prazoSelecionado) {
                throw new Error("O v8 não retornou alguma informação necessária para prosseguir.")
            }

            const bodySimulacao = ({
                instituicao,
                idTermo: resultado[0].idTermo,
                tabelaId: tabelaSelecionada,
                valorParcelas: resultado[0].valorMargemAvaliavel,
                qtdParcelas: parseInt(prazoSelecionado)
            })

            const { data } = await api.post(
                "/propostas/CLT/simular",
                bodySimulacao
            );

            const ofertasTratadas = ({
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

    const gerarLinkAutorizacaoDataPrev = async () => {
        const cpfNormalizado = normalizarCPF(cpf);

        try {
            setLoadingDP(true);

            const authData = JSON.parse(localStorage.getItem("auth_data"));
            const token = authData?.token;

            if (!token) {
                alert("Sessão expirada, faça login novamente.");
                return;
            }

            const {data} = await api.post(
                "/consultas/CLT/gerarAutorizacaoDataPrev",
                {
                    cpf: cpfNormalizado,
                    instituicao
                }
            );

            console.log(data.shortUrl);

            // lidando com a copia do link
            try {
                await navigator.clipboard.writeText(data.shortUrl);

                setTextoCopiado(true);

                // dps de 2 segundos some a msg
                setTimeout(() => {
                    setTextoCopiado(false);
                }, 3000);
            } catch (err) {
                console.error("Erro ao tentar copiar para a área de transferência: ", err);
                alert(`Não foi possível copiar o texto, aqui está o link: ${data.shortUrl}`);
            }
        } catch(err) {
            const msgError = getErrorMessage(err);
            alert(msgError)
        } finally {
            setLoadingDP(false);
        }
    }

    const handleChangeTabelaSelecionada = (event) => {
        setTabelaSelecionada(event.target.value);
    };

    const handleChangePrazoSelecionado = (event) => {
        setPrazoSelecionado(event.target.value);
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
        
                <button
                    className="btn-consultar"
                    onClick={consultar}
                    disabled={loading}
                >
                    {loading ? "Consultando..." : "Consultar"}
                </button>

                {instituicao == "Presenca bank" ? 
                    (
                        <div className="div-btn-gerar-link-dp">
                            <button
                                className="btn-consultar"
                                onClick={gerarLinkAutorizacaoDataPrev}
                                disabled={loadingDP}
                            >
                                {loadingDP ? "Gerando..." : "Gerar link de autorização dataprev"}
                            </button>

                            {textoCopiado ? (
                                <label className="btn-consultar label-copiado">Copiado!</label>
                            ) : ""}
                        </div>
                    )
                :
                    ("")
                }
            </div>

            {instituicao == "v8" ? 
                (
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
                ) 
            : 
                ("")
            }
        
            {/* INSTITUIÇÕES */}
            <div className="instituicoes">
                <span className="inst-title">Instituição:</span>
        
                <label className="radio-option">
                    <input
                        type="radio"
                        value="Presenca bank"
                        checked={instituicao === "Presenca bank"}
                        onChange={(e) => {
                            setInstituicao(e.target.value)
                            limparResultado()
                        }}
                    />
                    PRESENÇA BANK
                </label>

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
            </div>
        
            {/* RESULTADO */}
            <div className="result-vinculos">
                <h2>
                    {instituicao == "Presenca bank" ? (
                        "Vínculos empregatícios"
                    ) : instituicao == "v8" ? (
                        "Ofertas disponíveis"
                    ) : ""}
                            
                </h2>

                    {instituicao == "Presenca bank" ? (
                        <div className="div-cards-result">
                            {resultado && Array.isArray(resultado) ? (
                                resultado.map((item) => (
                                    // Enviando matricula como key para não bagunçar o mapping
                                    <CltResultadoCard key={item.matricula} resultado={item} />
                            ))
                            ) : (
                                resultado && <CltResultadoCard resultado={resultado} />
                            )}
                        </div>
                    ) : instituicao == "v8" ? (
                        <div className="div-cards-result">
                            {resultadoSimulacao && Array.isArray(resultadoSimulacao) ? (
                                resultadoSimulacao.map((item) => (
                                    // Enviando matricula como key para não bagunçar o mapping
                                    <CltResultadoCard key={item.matricula} resultado={item} />
                            ))
                            ) : (
                                resultadoSimulacao && <CltResultadoCard resultado={resultadoSimulacao} />
                            )}
                        </div>
                    ) : 
                        ("")
                    }
                
            </div>
        </div>
    );
}