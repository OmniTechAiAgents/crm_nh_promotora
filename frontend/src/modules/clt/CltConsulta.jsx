import { useState } from "react";
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
    const [loading, setLoading] = useState(false);
    const [loadingDP, setLoadingDP] = useState(false);
    const [textoCopiado, setTextoCopiado] = useState(false);

    const consultar = async () => {
        setResultado(null);

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
                ...vinculo
            }));

            // mandando o resultado para o card ainda sem tratar
            setResultado(ofertasTratadas);
        } catch (err) {
            // captura uma possível proposta inelegível
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
        } finally {
            setLoading(false);
        }
    };

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
            </div>
        
            {/* INSTITUIÇÕES */}
            <div className="instituicoes">
                <span className="inst-title">Instituição:</span>
        
                <label className="radio-option">
                    <input
                        type="radio"
                        value="Presenca bank"
                        checked={instituicao === "Presenca bank"}
                        onChange={(e) => setInstituicao(e.target.value)}
                    />
                    PRESENÇA BANK
                </label>
            </div>
        
            {/* RESULTADO */}
            <div className="result-vinculos">
                <h2>Vínculos empregatícios</h2>

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
            </div>
        </div>
    );
}