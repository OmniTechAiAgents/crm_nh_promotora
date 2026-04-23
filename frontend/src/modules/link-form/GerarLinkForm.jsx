import { useState } from "react";
import './gerarLinkForm.css'
import api from "../../api/client";

export default function GerarLinkForm() {
    const [cpf, setCpf] = useState("");
    const [instituicao, setInstituicao] = useState("c6");
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingCopy, setLoadingCopy] = useState(false);
    const [textoCopiado, setTextoCopiado] = useState(false);

    const handleGerarLinkForm = async () => {
        setResultado(null);

        const cpfNormalizado = normalizarCPF(cpf);

        try {
            setLoading(true);

            const authData = JSON.parse(localStorage.getItem("auth_data"));
            const token = authData?.token;

            if (!token) {
                setResultado({
                    status: "ERRO",
                    motivoErro: "Sessão expirada. Faça login novamente."
                });
                return;
            }

            const { data } = await api.post(
                "/consultas/CLT/gerarLinkFormalizacao",
                {
                    cpf: cpfNormalizado,
                    instituicao
                }
            );

            setResultado(data.link);
        } catch (err) {
            alert(`Erro ao gerar link de formalização do ${instituicao}: ${err}`);
        } finally {
            setLoading(false);
        }
    }

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
            alert("Erro ao copiar! Por favor, selecione e copie o texto manualmente.");
            console.error("Falha ao copiar:", err);
        }
    }

    return (
        <div className="consulta-container-clt">
            <h2 className="title-link-form">Gerar links de formalização</h2>

            {/* CPF + BOTÃO */}
            <form className="consulta-form-link">
                <div className="cpf-btn-div">
                    <div className="input-group">
                        <label className="label-link-form">CPF</label>
                        <input
                            placeholder="Digite o CPF"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            maxLength={14}
                        />
                    </div>

                    <button
                        className="btn-gerar-link"
                        onClick={() => handleGerarLinkForm()}
                        disabled={loading}
                    >
                        {loading ? "Gerando..." : "Gerar link"}
                    </button>
                </div>

                {/* INSTITUIÇÕES */}
                <div className="instituicoes">
                    <span className="inst-title">Instituição:</span>

                    <label className="radio-option-inst-link-form">
                        <input
                            type="radio"
                            value="c6"
                            checked={instituicao === "c6"}
                            onChange={(e) => {
                                setInstituicao(e.target.value)
                                limparResultado()
                            }}
                        />
                        c6
                    </label>
                </div>

                {resultado != null ? (
                    <div className="div-resultado">
                        <div className="input-group">
                            <label className="label-link-form">Resultado</label>
                            <input
                                value={resultado}
                                disabled={true}
                                className="input-resultado-link-form"
                            />
                        </div>

                        <button
                            className="btn-copiar-link"
                            onClick={() => copiarTexto(resultado)}
                            type="button"
                            disabled={loadingCopy}
                        >
                            {loadingCopy
                                ? "Copiando..."
                                : textoCopiado
                                    ? "Copiado!"
                                    : "Copiar link"}
                        </button>
                    </div>
                ) : ("")}
            </form>
        </div>
    );
}