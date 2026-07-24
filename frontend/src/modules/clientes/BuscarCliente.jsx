import { useState } from 'react';
import './RegistroCliente.css';
import api from "../../api/client";
import InfoClienteNovaVida from '../../components/InfoClienteNovaVida';
import InfoClienteLemit from '../../components/InfoClienteLemit';

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
            const { data } = await api.post("/clientes/lemit", 
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

    async function sincronizarDadosLemit(cpf) {
        const cpfNormalizadoCliente = normalizarCPF(cpf);

        setCarregando(true)
        setCliente({})

        try {
            const {data} = await api.patch(`/clientes/${cpfNormalizadoCliente}/sincronizar-lemit`);

            alert(data.msg);

            const dataCliente = await api.post("/clientes/lemit", 
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

    function formatar_data(data) {
        const [ ano, mes, dia ] = data.split('-');

        return `${dia}/${mes}/${ano}`;
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
                cliente.provider === "nova_vida" ? (
                    <InfoClienteNovaVida
                        cliente={cliente}
                        userRole={userRole}
                        formatar_data={formatar_data}
                        sincronizarDadosLemit={sincronizarDadosLemit}
                    />
                ) : cliente.provider === "Lemit" ? (
                    <InfoClienteLemit
                        cliente={cliente}
                        userRole={userRole}
                        formatar_data={formatar_data}
                        sincronizarDadosLemit={sincronizarDadosLemit}
                    />
                ) : null
            ) : null}
        </div>
    )
}