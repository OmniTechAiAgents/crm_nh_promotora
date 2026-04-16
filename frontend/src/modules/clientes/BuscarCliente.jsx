import { useState } from 'react';
import './RegistroCliente.css';
import api from "../../api/client";

export default function BuscarCliente() {
    const [ cpf, setCpf ] = useState("");
    const [ cliente, setCliente ] = useState({});
    const [ carregando, setCarregando ] = useState(false);

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
    const cpfNormalizado = normalizarCPF(cpf);

    async function handleSubmit(e) {
        e.preventDefault();
        
        if(!cpfNormalizado || cpfNormalizado == "") {
            return alert("Digite um cpf antes de pesquisar.")
        }

        setCarregando(true)
        setCliente({})

        try {
            const { data } = await api.post("/clientes/novavida", 
                {
                    cpf: cpfNormalizado,
                }
            );

            console.log(data);

            setCliente(data);
        } catch (err) {
            alert(`Erro ao buscar cliente: ${err.response.data.erro}`);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div>
            <h2>Busca de informações do cliente</h2>

            <form className="pesquisar-cliente-form" onSubmit={handleSubmit}>
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
                
                <button type='submit' className="btn-consultar btn-registrar-cliente">Pesquisar</button>
            </form>

            {carregando ? (<h2>Buscando...</h2>) : ""}

            {Object.keys(cliente).length > 0 ? (
                <form className='criar-cliente-container'>
                    <div className="input-group input-group-registro-cliente">
                        <label htmlFor="">Nome</label>
                        <input 
                            type="text"
                            placeholder="Teste da silva"
                            value={cliente.nome}
                            disabled={true}
                        />
                    </div>

                    <div className="input-group input-group-registro-cliente">
                        <label htmlFor="">Cpf</label>
                        <input 
                            type="text"
                            placeholder="000.000.000-00"
                            value={cliente.cpf}
                            disabled={true}
                        />
                    </div>

                    <div className="input-group input-group-registro-cliente">
                        <label htmlFor="">Data de nascimento</label>
                        <input 
                            type="text"
                            placeholder="DD-MM-YYYY"
                            value={cliente.data_nasc}
                            disabled={true}
                        />
                    </div>

                    <div className="input-group input-group-registro-cliente">
                        <label htmlFor="">Celular</label>
                        <input 
                            type="text"
                            placeholder="(11)99999-9999"
                            value={cliente.celular}
                            disabled={true}
                        />
                    </div>
                </form>
            ) : ("")}
        </div>
    )
}