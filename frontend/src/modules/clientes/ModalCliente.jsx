import api from "../../api/client";
import { useEffect, useState } from "react";
import './modalCliente.css';

export default function ModalCliente({cpf}) {
    const [ loading, setLoading ] = useState(false);
    const [ clienteData, setClienteData ] = useState(null);
    const [ errorRequest, setErrorRequest ] = useState(null);

    const buscarDadosCliente = async (propsCpf) => {
        try {
            setLoading(true);

            const response = await api.get(
                `/clientes?cpf=${propsCpf}`
            );

            setClienteData(response.data || []);
        } catch (error) {
            setClienteData(null);

            if (error.response.status == 424) {
                setErrorRequest(error.response.data.erro)
            } else {
                console.error(`Erro não tratado na hora de recuperar dados do cliente: ${error}`)
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!cpf) return;

        buscarDadosCliente(cpf);
    }, [cpf]);

    return (
        <div className="info-cliente-container">
            {loading ? "Carregando..." : clienteData && (
                <div>
                    <h3>Informações do cliente</h3>
                    <br />
                    <p><b>Nome:</b> {clienteData.nome}</p>
                    <p><b>Cpf:</b> {clienteData.cpf}</p>
                    <p><b>Data de nascimento:</b> {clienteData.data_nasc}</p>
                    <p><b>Celular:</b> {clienteData.celular}</p>
                </div>
            )}

            {errorRequest ? (
                <div>
                    <h3>Informações do cliente</h3>
                    <br />
                    <p><b>Erro ao consultar os dados do cliente:</b></p>
                    <br />
                    <p>{errorRequest}</p>
                </div>
            ): ""}
        </div>
    )
}