import ConsultasCLTPython from "../models/ConsultasCLTPython.js";
import { Op } from 'sequelize';
import Clientes from "../models/Clientes.js";
import db from "../config/db.js";

class ConsultasCLTPythonRepository {
    // cria vários registros com o array q vai receber fazendo transação para n dar merda
    async createMany(data) {
        const t = await db.transaction();
        try{
            const result = await ConsultasCLTPython.bulkCreate(data, { 
                transaction: t,

                // se vier um item com um id ja existente na tabela, ele atualiza esses seguintes valores:
                updateOnDuplicate: [
                    "valor_parcela",
                    "valor_solicitado",
                    "qtd_parcelas",
                    "updatedAt",
                    "ofertado"
                ]
            });
            await t.commit();
            return result;
        } catch (err) {
            if (t) await t.rollback();
            throw err;
        }
    }

    async searchDuplicates(cliente_id, instituicao, cnpj) {
        return ConsultasCLTPython.findOne({
            where: {
                cliente_id,
                instituicao,
                cnpj
            }
        })
    }

    async update(id, data) {
        return ConsultasCLTPython.update(
            data,
            {
                where: {
                    id
                }
            }
        )
    }

    async searchPagination(pesquisa, limite, offset) {
        const where = {}

        // adicionar a pesquisa para buscar o cpf na tabela "clientes"

        const result = await ConsultasCLTPython.findAndCountAll({
            where,
            include: [
                {
                    model: Clientes,
                    as: 'cliente',
                }
            ],
            limit: limite,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return {
            data: result.rows,
            totalPages: Math.ceil(result.count / limite)
        }
    }
}

export default new ConsultasCLTPythonRepository();