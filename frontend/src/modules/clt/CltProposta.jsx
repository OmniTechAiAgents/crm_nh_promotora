import { useState } from "react";
import api from "../../api/client";
import "./CltProposta.css";
import { criarPropostaCLT } from "../../services/cltService";

const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor || 0);
};

export default function CltProposta({
    instituicao,
    cpf,
    sexo,
    nomeMae,
    cnpjEmpregador,
    registroEmpregaticio,
    tabelasDisponíveis,
    onSuccess,
}) {
    // CONTA
    const [bankCode, setBankCode] = useState("");
    const [branchNumber, setBranchNumber] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountDigit, setAccountDigit] = useState("");
    const [accountType, setAccountType] = useState("");
    const [tabelaSelecionada, setTabelaSelecionada] = useState("");

    const [loading, setLoading] = useState(false);
    const [erros, setErros] = useState({});

    const enviarProposta = async () => {
        try {
            setLoading(true);

            const authData = JSON.parse(localStorage.getItem("auth_data"));
            const token = authData?.token;

            if (!token) {
                alert("Sessão expirada.");
                return;
            }

            const objTabelaSelecionada = tabelasDisponíveis.find(
                (tabela) => tabela.id_tabela.toString() === tabelaSelecionada.toString()
            )

            if (!objTabelaSelecionada) {
                alert("Erro ao encontrar os dados da tabela.");
                return;
            }

            const body = {
                instituicao,
                bankCode,
                accountType,
                accountNumber,
                accountDigit,
                branchNumber,
                cpf,
                sexo,
                nomeMae,
                cnpjEmpregador,
                registroEmpregaticio,
                qtdParcelas: objTabelaSelecionada.prazo,
                valorParcelas: objTabelaSelecionada.valorLiberado,
                tabelaId: objTabelaSelecionada.id_tabela
            }

            // console.log(body)
            await criarPropostaCLT(body);

            alert("Proposta criada com sucesso!");
            onSuccess?.();
        } catch (err) {
            const status = err.response?.status;

            if (status === 424) {
                alert(err.response?.data?.erro ? `Erro ao criar proposta: ${err.response?.data?.erro}` : "Erro desconhecido de dependencia (424), chame um administrador.");
                return;
            }

            alert(err.response?.data?.erro || "Erro desconhecido ao criar proposta");

        } finally {
            setLoading(false);
        }
    }

    // ---------- UI ----------
    return (
    <div className="proposta-container">
        <div className="proposta-header">
        <h2>Digitação da Proposta</h2>
        <p>Preencha os dados para envio da proposta</p>
        </div>

        <div className="proposta-form">
        {/* CONTA */}
            <div className="form-section fade-in">
                <input placeholder="Banco" value={bankCode} onChange={(e) => setBankCode(e.target.value)} />
                <input placeholder="Agência" value={branchNumber} onChange={(e) => setBranchNumber(e.target.value)} />
                <input placeholder="Conta" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                <input placeholder="Dígito" value={accountDigit} onChange={(e) => setAccountDigit(e.target.value)} />

                <select
                    value={tabelaSelecionada}
                    onChange={(e) => setTabelaSelecionada(e.target.value)}
                >
                    <option value="">Selecione a tabela</option>
                    
                    {tabelasDisponíveis && tabelasDisponíveis.map((tabela) => (
                        <option key={tabela.id_tabela} value={tabela.id_tabela}>
                            {tabela.nome} - {formatarMoeda(tabela.valorLiberado)}
                        </option>
                    ))}
                </select>

                <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                >
                    <option value="">Selecione o tipo de conta</option>
                    <option value="corrente">Corrente</option>
                    <option value="poupanca">Poupança</option>
                </select>
            </div>

            <button
                className="btn-confirmar"
                onClick={enviarProposta}
                disabled={loading}
            >
                {loading ? "Enviando..." : "Confirmar Proposta"}
            </button>
        </div>
    </div>
    );
}