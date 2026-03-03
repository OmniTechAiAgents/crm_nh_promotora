import api from "../../api/client";
import { useEffect, useState } from "react";
import './modalCliente.css';

export default function ModalCliente({cpf}) {
    const [ loading, setLoading ] = useState(false);
    const [ clienteData, setClienteData ] = useState([]);

    const buscarDadosCliente = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                `/clientes?cpf=${cpf}`
            );

            setClienteData(response.data.data || []);
        } catch (error) {
            console.error("Erro ao dados do cliente:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        buscarDadosCliente();
    }, [])

    return (
        <div className="info-cliente-container">
            {loading ? "Carregando" : (
                <p>{clienteData}</p>
            )}
        </div>
    )
}