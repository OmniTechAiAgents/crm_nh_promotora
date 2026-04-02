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

export default function CltPropostaV8({
    instituicao,
    cpf,
    sexo,
    qtdParcelas,
    valorParcelas,
    tabelaId,
    simulacaoId,
    nomeTabela,
    taxaJurosMensal,
    valorSolicitado,
    valorLiberado,
    
    onSuccess,
}) {
    const [formaRecebimento, setFormaRecebimento] = useState("PIX");

    // PIX
    const [pixKey, setPixKey] = useState("");
    const [pixKeyType, setPixKeyType] = useState("");

    // CONTA
    const [bankCode, setBankCode] = useState("");
    const [branchNumber, setBranchNumber] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountDigit, setAccountDigit] = useState("");

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

            const body = {
                instituicao,
                pixKeyType: pixKeyType == "" ? null : pixKeyType,
                pixKey: pixKey == "" ? null : pixKey,
                cpf,
                sexo,
                qtdParcelas,
                valorParcelas,
                tabelaId,
                simulacaoId,
                nomeTabela,
                taxaJurosMensal,
                valorSolicitado,
                valorLiberado,

                bankCode: bankCode == "" ? null : bankCode,
                accountNumber: accountNumber == "" ? null : accountNumber,
                accountDigit: accountDigit == "" ? null : accountDigit,
                branchNumber: branchNumber == "" ? null : branchNumber,
            }

            console.log(body)

            await criarPropostaCLT(body);

            // console.log(body)

            alert("Proposta criada com sucesso!");
            onSuccess?.();
        } catch (err) {
            const status = err.response?.status;

            if (status === 424) {
                alert(err.response?.data?.erro ? `Erro ao criar proposta: ${err.response?.data?.erro}` : "Erro desconhecido de dependencia (424), chame um administrador.");
                return;
            }

            alert(err.response?.data?.erro || err.message || "Erro desconhecido ao criar proposta");

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
            <div className="form-section">
                <label className="section-title">Forma de recebimento</label>

                <div className="radio-group">
                <label className={`radio-card ${formaRecebimento === "PIX" ? "ativo" : ""}`}>
                    <input
                    type="radio"
                    checked={formaRecebimento === "PIX"}
                    onChange={() => setFormaRecebimento("PIX")}
                    />
                    PIX
                </label>

                <label className={`radio-card ${formaRecebimento === "CONTA" ? "ativo" : ""}`}>
                    <input
                    type="radio"
                    checked={formaRecebimento === "CONTA"}
                    onChange={() => setFormaRecebimento("CONTA")}
                    />
                    Conta Bancária
                </label>
                </div>
            </div>

            {/* PIX */}
            {formaRecebimento === "PIX" && (
                <div className="form-section fade-in">
                    <input
                        placeholder="Chave PIX"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                    />

                    <select
                        value={pixKeyType}
                        onChange={(e) => setPixKeyType(e.target.value)}
                    >
                        <option value="">Selecione o tipo de chave PIX</option>
                        <option value="cpf">CPF</option>
                        <option value="email">Email</option>
                        <option value="telefone">Telefone</option>
                        <option value="chave_aleatoria">Aleatória</option>
                    </select>
                </div>
            )}

            {/* CONTA */}
            {formaRecebimento === "CONTA" && (
                <div className="form-section fade-in">
                <input placeholder="Banco" value={bankCode} onChange={(e) => setBankCode(e.target.value)} />
                <input placeholder="Agência" value={branchNumber} onChange={(e) => setBranchNumber(e.target.value)} />
                <input placeholder="Conta" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                <input placeholder="Dígito" value={accountDigit} onChange={(e) => setAccountDigit(e.target.value)} />
            </div>
            )}

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