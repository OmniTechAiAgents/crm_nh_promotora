import ConsultasLoteRepository from "../repositories/ConsultasLoteRepository.js";
import HttpException from "../utils/HttpException.js";
import { PublisherRabbitMQ } from "../utils/PublisherRabbitMQ.js";
import AuthRepository from "../repositories/AuthRepository.js";
import ConsultasFGTSRepository from "../repositories/ConsultasFGTSRepository.js";


class ConsultasLoteService {
    async Postar(data) {
        try {
            // manda para o DB
            const result = await ConsultasLoteRepository.create(data);

            // captura os dados necessários e monta a msg para o rabbitMQ
            await PublisherRabbitMQ("consultas_lote", result.dataValues);
        } catch (err) {
            throw err;
        }
    }

    async Editar(consultaId, status, mensagem) {
        try {
            const existe = await ConsultasLoteRepository.findOneConsultaById(consultaId);
            if (!existe) throw new HttpException("Consulta não encontrada", 404);

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

            // começando a recuperar o total de todos os lotes da pag
            const idsDosLotes = result.data.map(lote => lote.id);

            const totais = await ConsultasFGTSRepository.CountTotalsByLoteIds(idsDosLotes);

            const mapaDeTotais = {};
            totais.forEach(row => {
                mapaDeTotais[row.id_consulta_lote] = row.total;
            });

            const newData = result.data.map((lote) => {

                const loteJson = lote.toJSON();

                const totalConcluido = mapaDeTotais[loteJson.id] || 0;

                // se loteJson for 0, ele simplesmente coloca 0 para n dividir por 0
                const calculo = loteJson.total_consultas > 0
                    ? (totalConcluido / loteJson.total_consultas) * 100
                    : 0;
                loteJson.progresso = Number(calculo.toFixed(2));

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
                    valorLiquidoTotal: 0,
                });

                delete loteJson.consultas;
                delete loteJson.total_consultas;

                return {
                    ...loteJson,
                    resumo
                };
            });

            return {
                ...result,
                data: newData
            };
        } catch (err) {
            throw err;
        }
    }

    async ReatribuirConsultaLote(id_consulta_lote, id_promotor) {
        try {
            // verifica a existencia da consulta em lote e do promotor
            const consultaLoteExiste = await ConsultasLoteRepository.findOneConsultaById(id_consulta_lote);
            if (!consultaLoteExiste) throw new HttpException("Não existe nenhuma consulta em lote com esse id", 404);
            const promotorExiste = await AuthRepository.findOneById(id_promotor)
            if (!promotorExiste) throw new HttpException("Não existe nenhum promotor com esse id.", 404);


            // reatribui todas as consultas na tabela "cpfs_individuais"
            await ConsultasFGTSRepository.UpdatePromotorIdByConsultaLoteId(id_consulta_lote, id_promotor);

            // reatribui o registro de consulta lote na tabela "consultas_lote"
            await ConsultasLoteRepository.UpdateUsuarioIdConsultaLote(id_consulta_lote, id_promotor);
        } catch (err) {
            throw err;
        }
    }
}

export default new ConsultasLoteService();