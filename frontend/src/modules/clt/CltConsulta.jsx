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
  const data = error.response?.data;

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
            // console.error("ERRO CONSULTA: ", err);

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

    return (
        <div className="consulta-container">
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
            {resultado && Array.isArray(resultado) ? (
                resultado.map((item) => (
                    // Enviando matricula como key para não bagunçar o mapping
                    <CltResultadoCard key={item.matricula} resultado={item} />
                ))
            ) : (
                resultado && <CltResultadoCard resultado={resultado} />
            )}
        </div>
    );
}