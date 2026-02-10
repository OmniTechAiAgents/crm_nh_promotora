import { useState } from "react";
import api from "../../api/client";
import "./fgtsProposta.css";

export default function FgtsProposta({ financialId, onSuccess }) {
  const [formaRecebimento, setFormaRecebimento] = useState("PIX");

  const [pixChave, setPixChave] = useState("");
  const [pixTipo, setPixTipo] = useState("CPF");

  const [banco, setBanco] = useState("");
  const [agencia, setAgencia] = useState("");
  const [conta, setConta] = useState("");
  const [tipoConta, setTipoConta] = useState("CORRENTE");

  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});

  // ---------- VALIDAÇÃO ----------
  const validar = () => {
    const novosErros = {};

    if (!financialId) novosErros.financialId = true;
    if (!email) novosErros.email = true;
    if (!telefone) novosErros.telefone = true;

    if (formaRecebimento === "PIX") {
      if (!pixChave) novosErros.pixChave = true;
    }

    if (formaRecebimento === "CONTA") {
      if (!banco) novosErros.banco = true;
      if (!agencia) novosErros.agencia = true;
      if (!conta) novosErros.conta = true;
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // ---------- ENVIO ----------
  const enviarProposta = async () => {
    console.log("ENTROU NO enviarProposta");

    console.log("financialId recebido:", financialId);

    const valido = validar();
    console.log("VALIDAÇÃO:", valido);

    if (!valido) {
      console.log("ERROS DE VALIDAÇÃO:", erros);
      alert("Validação bloqueou o envio");
      return;
    }

    try {
      setLoading(true);

      const authData = JSON.parse(localStorage.getItem("auth_data"));
      const token = authData?.token;

      const payload = {
        financial_id: financialId,
        forma_recebimento: formaRecebimento,
        contato: {
          email,
          telefone,
        },
      };

      if (formaRecebimento === "PIX") {
        payload.pix = {
          chave: pixChave,
          tipo: pixTipo,
        };
      }

      if (formaRecebimento === "CONTA") {
        payload.conta_bancaria = {
          banco,
          agencia,
          conta,
          tipo_conta: tipoConta,
        };
      }

      console.log("VOU FAZER POST AGORA");
      console.log("Payload enviado:", payload);

      await api.post("/propostas/fgts", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("POST FINALIZADO");

      alert("Proposta enviada com sucesso!");
      onSuccess?.();

    } catch (err) {
      console.error("Erro backend:", err.response?.data || err);
      alert("Erro ao enviar proposta");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="card proposta-digitacao">
      <h3>Digitação da Proposta</h3>

      {!financialId && (
        <p className="erro-texto">
          Erro interno: financialId não encontrado
        </p>
      )}

      <div className="form-group">
        <label>Email</label>
        <input
          className={erros.email ? "erro" : ""}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Telefone</label>
        <input
          className={erros.telefone ? "erro" : ""}
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
      </div>

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
          <div className="form-group">
            <label>Chave PIX</label>
            <input
              className={erros.pixChave ? "erro" : ""}
              value={pixChave}
              onChange={(e) => setPixChave(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Tipo da chave</label>
            <select
              value={pixTipo}
              onChange={(e) => setPixTipo(e.target.value)}
            >
              <option value="CPF">CPF</option>
              <option value="EMAIL">Email</option>
              <option value="TELEFONE">Telefone</option>
              <option value="ALEATORIA">Aleatória</option>
            </select>
          </div>
        </>
      )}

      {formaRecebimento === "CONTA" && (
        <>
          <div className="form-group">
            <label>Banco</label>
            <input value={banco} onChange={(e) => setBanco(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Agência</label>
            <input value={agencia} onChange={(e) => setAgencia(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Conta</label>
            <input value={conta} onChange={(e) => setConta(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Tipo de Conta</label>
            <select
              value={tipoConta}
              onChange={(e) => setTipoConta(e.target.value)}
            >
              <option value="CORRENTE">Corrente</option>
              <option value="POUPANCA">Poupança</option>
            </select>
          </div>
        </>
      )}

      {/* BOTÃO REAL */}
      <button
        className="btn-principal"
        type="button"
        onClick={enviarProposta}
        disabled={loading || !financialId}
      >
        {loading ? "Enviando..." : "Confirmar Proposta"}
      </button>
    </div>
  );
}
