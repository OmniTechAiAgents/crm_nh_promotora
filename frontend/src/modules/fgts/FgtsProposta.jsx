import { useState } from "react";
import api from "../../api/client";
import { criarPropostaFGTS } from "../../services/fgtsService";
import "./fgtsProposta.css";

export default function FgtsProposta({
  financialId,
  cpf,
  instituicao,
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
  const [accountType, setAccountType] = useState("");

  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});

  // ---------- VALIDAÇÃO ----------
  const validar = () => {
    const e = {};

    if (!financialId) e.financialId = true;
    if (!cpf) e.cpf = true;
    if (!instituicao) e.instituicao = true;

    if (formaRecebimento === "PIX") {
      if (!pixKey || pixKey.trim() === "") e.pixKey = true;
      if (!pixKeyType || pixKeyType.trim() === "") e.pixKeyType = true;
    }

    if (formaRecebimento === "CONTA") {
      if (!bankCode || bankCode.trim() === "") e.bankCode = true;
      if (!branchNumber || branchNumber.trim() === "") e.branchNumber = true;
      if (!accountNumber || accountNumber.trim() === "") e.accountNumber = true;
      if (!accountDigit || accountDigit.trim() === "") e.accountDigit = true;

      if (
        accountType === "pagamento" &&
        instituicao !== "Nossa fintech"
      ) {
        e.accountType = true;
      }
    }

    setErros(e);
    return Object.keys(e).length === 0;
  };

  // ---------- ENVIO ----------
  const enviarProposta = async () => {
  // 1️⃣ Validação estrutural
  if (!financialId || !cpf || !instituicao) {
    alert("Erro interno. Refaça a simulação.");
    return;
  }

  // 2️⃣ Validação de formulário
  if (!validar()) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  try {
    setLoading(true);

    const authData = JSON.parse(localStorage.getItem("auth_data"));
    const token = authData?.token;

    if (!token) {
      alert("Sessão expirada.");
      return;
    }

    const body = {
      cpf,
      instituicao,
    };

    if (formaRecebimento === "PIX") {
      body.pixKey = pixKey.trim();
      body.pixKeyType = pixKeyType;
    } else {
      body.bankCode = bankCode.trim();
      body.branchNumber = branchNumber.trim();
      body.accountNumber = accountNumber.trim();
      body.accountDigit = accountDigit.trim();
      body.accountType = accountType;
    }

    console.table(body);

    await criarPropostaFGTS(financialId, body);

    alert("Proposta criada com sucesso!");
    onSuccess?.();

  } catch (err) {
    const status = err.response?.status;

    if (status === 424) {
      alert(err.response?.data?.msg || "Erro de dependência (424).");
      return;
    }

    alert(err.response?.data?.msg || "Erro ao criar proposta");

  } finally {
    setLoading(false);
  }
};


  // ---------- UI ----------
return (
  <div className="proposta-container">
    <div className="proposta-header">
      <h2>Digitação da Proposta</h2>
      <p>Preencha os dados para envio da proposta</p>
    </div>

    <div className="proposta-form">

      {/* FORMA DE RECEBIMENTO */}
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

          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            <option value="">Selecione o tipo de conta</option>
            <option value="corrente">Corrente</option>
            <option value="poupanca">Poupança</option>
            {instituicao === "Nossa fintech" && (
              <option value="pagamento">Pagamento</option>
            )}
          </select>
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