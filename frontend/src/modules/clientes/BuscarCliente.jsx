import { useState } from 'react';
import './RegistroCliente.css';
import api from "../../api/client";

export default function BuscarCliente() {
    const [ cpf, setCpf ] = useState("");
    const [ cliente, setCliente ] = useState({});
    const [ carregando, setCarregando ] = useState(false);

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

            setCliente(data);
        } catch (err) {
            alert(`Erro ao buscar cliente: ${err.response.data.erro}`);
        } finally {
            setCarregando(false);
        }
    }

    async function sincronizarDadosNovaVida(cpf) {
        const cpfNormalizadoCliente = normalizarCPF(cpf);

        setCarregando(true)
        setCliente({})

        try {
            const {data} = await api.patch(`/clientes/${cpfNormalizadoCliente}/sincronizar-novavida`);

            alert(data.msg);

            const dataCliente = await api.post("/clientes/novavida", 
                {
                    cpf: cpfNormalizado,
                }
            );

            setCliente(dataCliente.data);
        } catch (err) {
            alert(`Erro ao sincronizar dados do cliente: ${err.response.data.erro}`);
        } finally {
            setCarregando(false)
        }
    }

    // recupera a role do usuário do local_storage
    const userRole = JSON.parse(localStorage.getItem('auth_data') || '{}')?.user?.roles?.[0];
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
                <form className='infos-cliente-container'>
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

                    {userRole == "admin" ? (
                        <button onClick={() => sincronizarDadosNovaVida(cliente.cpf)} type='button' className="btn-consultar btn-sincronizar-dados-nv">Sincronizar dados com nova vida</button>
                        ) : ("")}
                </form>
            ) : ("")}
        </div>
    )
}