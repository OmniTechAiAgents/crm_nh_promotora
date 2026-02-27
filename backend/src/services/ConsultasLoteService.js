import ConsultasLoteRepository from "../repositories/ConsultasLoteRepository.js";
import HttpException from "../utils/HttpException.js";
import { PublisherRabbitMQ } from "../utils/PublisherRabbitMQ.js";


class ConsultasLoteService {
    async Postar(data) {
        try {
            // manda para o DB
            const result = await ConsultasLoteRepository.create(data);

            // captura os dados necessários e monta a msg para o rabbitMQ
            await PublisherRabbitMQ("consultas_lote", result.dataValues);
        } catch(err) {
            throw err;
        }
    }

    async Editar(consultaId, status, mensagem) {
        try {
            const existe = await ConsultasLoteRepository.findOneConsultaById(consultaId);
            if(!existe) throw new HttpException("Consulta não encontrada", 404);

            const bodyDB = ({
                ...existe,
                status: status,
                mensagem: mensagem
            });

            return await ConsultasLoteRepository.update(consultaId, bodyDB);
        } catch (err) {
            throw err;
        }
    }

    async RecuperarConsultas(pesquisa, page, limit) {
        try {
            const offset = (page - 1) * limit;

            const result = await ConsultasLoteRepository.SearchPagination(pesquisa, limit, offset);

            const newData = result.data.map((lote) => {

                const loteJson = lote.toJSON();

                const consultas = loteJson.consultas || [];

                const resumo = consultas.reduce((acc, consulta) => {

                    acc.quantidade += 1;
                    acc.saldoTotal += Number(consulta.saldo) || 0;
                    acc.valorBrutoTotal += Number(consulta.valor_bruto) || 0;
                    acc.valorLiquidoTotal += Number(consulta.valor_liquido) || 0;

                    return acc;

                }, {
                    quantidade: 0,
                    saldoTotal: 0,
                    valorBrutoTotal: 0,
                    valorLiquidoTotal: 0
                });

                delete loteJson.consultas;

                return {
                    ...loteJson,
                    resumo
                };
            });

            return {
                ...result,
                data: newData
            };
        } catch(err) {
            throw err;
        }
    }
}

export default new ConsultasLoteService();