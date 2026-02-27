import { useState } from "react"
import './RegistroCliente.css';
import api from "../../api/client";

export default function RegistrarNovoCliente() {
    const [ nome, setNome ] = useState("");
    const [ cpf, setCpf ] = useState("");
    const [displayDate, setDisplayDate] = useState("");
    const [data_nasc, setDataNasc] = useState("");
    const [displayCelular, setDisplayCelular] = useState("");
    const [celular, setCelular] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const { data } = await api.post("/clientes", 
                {
                    nome: nome,
                    cpf: cpfNormalizado,
                    data_nasc: data_nasc,
                    celular: celular
                }
            );

            alert("Cliente registrado com sucesso, já pode receber novas propostas.")
        } catch (err) {
            alert(`Erro ao registrar cliente: ${err.response.data.erro}`);
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

    const formatDisplayDate = (value) => {
        const cleaned = value.replace(/\D/g, "").slice(0, 8);

        const day = cleaned.slice(0, 2);
        const month = cleaned.slice(2, 4);
        const year = cleaned.slice(4, 8);

        if (cleaned.length <= 2) {
            return day;
        } else if (cleaned.length <= 4) {
            return `${day}-${month}`;
        } else {
            return `${day}-${month}-${year}`;
        }
    };

    const convertToISO = (displayDate) => {
        const parts = displayDate.split("-");

        if (parts.length !== 3) return "";

        const [day, month, year] = parts;

        if (year.length === 4) {
            return `${year}-${month}-${day}`;
        }

        return "";
    };

    const formatDisplayPhone = (value) => {
        let cleaned = value.replace(/\D/g, "");

        // Se tiver exatamente 10 dígitos e não tiver 9 após o DDD
        if (cleaned.length === 10 && cleaned[2] !== "9") {
            cleaned = cleaned.slice(0, 2) + "9" + cleaned.slice(2);
        }

        // Limita depois da possível correção
        cleaned = cleaned.slice(0, 11);

        const ddd = cleaned.slice(0, 2);
        const firstPart = cleaned.slice(2, 7);
        const secondPart = cleaned.slice(7, 11);

        if (cleaned.length === 0) return "";
        if (cleaned.length <= 2) return `(${ddd}`;
        if (cleaned.length <= 7) return `(${ddd})${firstPart}`;

        return `(${ddd})${firstPart}-${secondPart}`;
    };

    const getCleanPhone = (value) => {
        let cleaned = value.replace(/\D/g, "");

        if (cleaned.length === 10 && cleaned[2] !== "9") {
            cleaned = cleaned.slice(0, 2) + "9" + cleaned.slice(2);
        }

        return cleaned.slice(0, 11);
    };

    const cpfNormalizado = normalizarCPF(cpf);
    
    return (
        <div className="criar-cliente-container">
            <h2>Registro de cliente manual</h2>

            <form className="criar-cliente-form" onSubmit={handleSubmit}>
                <div className="input-group input-group-registro-cliente">
                    <label htmlFor="">Nome</label>
                    <input 
                        type="text"
                        placeholder="Teste da silva"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                </div>

                <div className="input-group input-group-registro-cliente">
                    <label htmlFor="">Cpf</label>
                    <input 
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        maxLength={14}
                    />
                </div>

                <div className="input-group input-group-registro-cliente">
                    <label htmlFor="">Data de nascimento</label>
                    <input 
                        type="text"
                        placeholder="DD-MM-YYYY"
                        value={displayDate}
                            onChange={(e) => {
                            const formatted = formatDisplayDate(e.target.value);
                            setDisplayDate(formatted);
                            setDataNasc(convertToISO(formatted));
                        }}
                    />
                </div>

                <div className="input-group input-group-registro-cliente">
                    <label htmlFor="">Celular</label>
                    <input 
                        type="text"
                        placeholder="(11)99999-9999"
                        value={displayCelular}
                        onChange={(e) => {
                            const formatted = formatDisplayPhone(e.target.value);
                            const cleaned = getCleanPhone(formatted);

                            setDisplayCelular(formatted);
                            setCelular(cleaned);
                        }}
                    />
                </div>

                <button type="submit" className="btn-consultar btn-registrar-cliente">Enviar</button>
            </form>
        </div>
    )
}