import { useState } from "react";
import api from "../../api/client";
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
    // // if (validar()) {
    //   console.log(formaRecebimento, pixKey, pixKeyType, bankCode, branchNumber, accountNumber, accountDigit, accountType);

    //   alert("Campos obrigatórios não preenchidos.");
    //   return;
    // }
    

    try {
      setLoading(true);

      const authData = JSON.parse(localStorage.getItem("auth_data"));
      const token = authData?.token;

      if (!token) {
        alert("Sessão expirada.");
        return;
      }

      // BODY BASE
      const body = {
        cpf,
        instituicao,
      };

      // PIX OU CONTA (NUNCA OS DOIS)
      if (formaRecebimento === "PIX") {
        body.pixKey = pixKey;
        body.pixKeyType = pixKeyType;
      } else {
        body.bankCode = bankCode;
        body.branchNumber = branchNumber;
        body.accountNumber = accountNumber;
        body.accountDigit = accountDigit;
        body.accountType = accountType;
      }
      console.table(body);

      await api.post(
        `/propostas/fgts?financialId=${financialId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Proposta criada com sucesso!");
      onSuccess?.();

    } catch (err) {
      console.error(err.response?.data || err);
      alert(
        err.response?.data?.msg ||
        "Erro ao criar proposta"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="card proposta-digitacao">
      <h3>Digitação da Proposta</h3>

      <div className="form-group">
        <label>Forma de recebimento</label>
        <label>
          <input
            type="radio"
            checked={formaRecebimento === "PIX"}
            onChange={() => setFormaRecebimento("PIX")}
          />
          PIX
        </label>
        <label>
          <input
            type="radio"
            checked={formaRecebimento === "CONTA"}
            onChange={() => setFormaRecebimento("CONTA")}
          />
          Conta Bancária
        </label>
      </div>

      {formaRecebimento === "PIX" && (
        <>
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
        </>
      )}

      {formaRecebimento === "CONTA" && (
        <>
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
        </>
      )}

      <button
        className="btn-principal"
        onClick={enviarProposta}
        disabled={loading}
      >
        {loading ? "Enviando..." : "Confirmar Proposta"}
      </button>
    </div>
  );
}
