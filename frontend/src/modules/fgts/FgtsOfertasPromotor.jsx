import { useEffect, useState } from "react";
import api from "../../api/client";
import FgtsResultadoCard from "./FgtsResultadoCard";
import "./fgts.css";

export default function FgtsOfertasPromotor() {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ofertaSelecionada, setOfertaSelecionada] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    buscarOfertas();
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

  // Adapter para o formato do Card
  const adaptarResultado = (item) => {
    return {
      status: item.elegivelProposta ? "ELEGIVEL" : "NAO_ELEGIVEL",
      valorLiquido: item.valor_liquido,
      instituicaoEscolhida: item.banco,
      anuidades: item.anuidades?.map((a) => ({
        dueDate: a.due_date,
        amount: a.total_amount,
      })),
      cpf: item.cpf,
      financialId: item.chave,
      motivoErro: item.mensagem,
    };
  };

  return (
    <div className="container">
      <h2>Minhas Ofertas FGTS</h2>

      {loading && <p>Carregando...</p>}

      {!loading && ofertas.length === 0 && (
        <p>Nenhuma oferta encontrada.</p>
      )}

      {/* LISTA */}
      <div className="lista-ofertas">
        {ofertas.map((item) => (
          <div key={item.id} className="linha-oferta">
            <span
              className="cpf-link"
              onClick={() =>
                setOfertaSelecionada(
                  ofertaSelecionada?.id === item.id ? null : item
                )
              }
            >
              {item.cpf}
            </span>

            <span>
              R$ {Number(item.valor_liquido || 0).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* CARD */}
      {ofertaSelecionada && (
        <FgtsResultadoCard
          resultado={adaptarResultado(ofertaSelecionada)}
        />
      )}

      {/* Paginação simples */}
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
  );
}