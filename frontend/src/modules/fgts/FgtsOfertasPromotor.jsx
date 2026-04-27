import { useEffect, useState } from "react";
import api from "../../api/client";
import FgtsResultadoCard from "./FgtsResultadoCard";
import React from "react";
import "./fgts.css";
import Modal from "../../components/Modal";
import ModalCliente from "../clientes/ModalCliente";

export default function FgtsOfertasPromotor() {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ofertaSelecionada, setOfertaSelecionada] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [cpfSelecionado, setCpfSelecionado] = useState(null);

  useEffect(() => {
    buscarOfertas();
    setOfertaSelecionada(null); // limpa seleção ao trocar página
  }, [pagina]);

  const buscarOfertas = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/consultas/FGTS/manual?pagina=${pagina}&limite=25&elegivelOferta=true`
      );

      setOfertas(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Erro ao buscar ofertas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Adapter para o formato esperado pelo FgtsResultadoCard
  const adaptarResultado = (item) => {
    return {
      status: item.elegivelProposta ? "ELEGIVEL" : "NAO_ELEGIVEL",
      valorLiquido: item.valor_liquido,
      instituicaoEscolhida: item.API,
      anuidades: item.anuidades?.map((a) => ({
        dueDate: a.due_date,
        amount: a.total_amount,
      })),
      cpf: item.cpf,
      financialId: item.chave,
      motivoErro: item.mensagem,
    };
  };

  const marcarPropostaInelegivel = async (id_oferta) => {
    const motivo = prompt("Tem certeza que deseja marcar essa proposta como inelegível? Se sim, digite o motivo:")

    try {
      const response = await api.patch(`/consultas/FGTS/marcarInelegivel`,
        {
          id_consulta: id_oferta,
          motivo: motivo
        }
      );

      alert(`${response.data?.msg}`);

      window.location.reload();
    } catch (error) {
      alert("Erro ao marcar oferta como inelegível.")
      console.error("Erro ao marcar oferta como inelegivel:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h2>Minhas Ofertas FGTS</h2>

      {loading && <p>Carregando...</p>}

      {!loading && ofertas.length === 0 && (
        <p>Nenhuma oferta encontrada.</p>
      )}

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        >
          <ModalCliente cpf={cpfSelecionado} />
      </Modal>

      <div className="fgts-layout">
        <table className="tabela-ofertas">
              <thead>
                <tr>
                  <th>CPF</th>
                  <th>Valor</th>
                  <th>Data (criação)</th>
                  <th>Data (ultima alteração)</th>
                  <th>Id consulta lote</th>
                  <th>Ações</th>
                </tr>
              </thead>

            <tbody>
              {ofertas.map((item) => (
                <React.Fragment key={item.id}>
                   <tr
                    className={`linha-oferta ${
                      ofertaSelecionada?.id === item.id ? "ativa" : ""
                    }`}
                  >
                    <td className="cpf-link">
                      {item.cpf}
                    </td>

                    <td>
                      {Number(item.valor_liquido || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>

                    <td>
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </td>

                    <td>
                      {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                    </td>

                    <td>
                      {item.id_consulta_lote}
                    </td>

                    <td className="td-button">
                      <button 
                        className="btn-acoes-oferta btn-criar-proposta"
                        onClick={() =>
                          setOfertaSelecionada(
                            ofertaSelecionada?.id === item.id ? null : item
                          )
                        }>
                        Criar proposta
                      </button>

                      <button 
                        className="btn-acoes-oferta btn-info-cliente"
                        onClick={() => {
                            setOpenModal(true)
                            setCpfSelecionado(item.cpf)
                          }}
                        >
                          Info. cliente
                        </button>
                      
                      <button 
                        className="btn-acoes-oferta btn-marcar-inelegivel"
                        onClick={() => marcarPropostaInelegivel(item.id)}
                        >
                          Marcar inelegível
                      </button>
                    </td>
                  </tr>

                  <tr
                    className={`linha-expandida ${
                      ofertaSelecionada?.id === item.id ? "aberta" : "fechada"
                    }`}
                  >
                    <td colSpan={3}>
                      <div className="expand-wrapper">
                        <FgtsResultadoCard resultado={adaptarResultado(item)} />
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* PAGINAÇÃO */}
          <div className="paginacao">
            <button
              disabled={pagina === 1}
              onClick={() => setPagina(pagina - 1)}
            >
              Anterior
            </button>

            <span>
              Página {pagina} de {totalPages}
            </span>

            <button
              disabled={pagina === totalPages}
              onClick={() => setPagina(pagina + 1)}
            >
              Próxima
            </button>
          </div>
      </div>
    </div>
  );
}