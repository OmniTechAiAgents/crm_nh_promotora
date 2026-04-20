import ConsultasCLTPython from "../models/ConsultasCLTPython.js";
import { Op } from 'sequelize';
import Clientes from "../models/Clientes.js";
import db from "../config/db.js";
import Usuario from "../models/Usuario.js";

class ConsultasCLTPythonRepository {
    // cria vários registros com o array q vai receber fazendo transação para n dar merda
    async createMany(data, cenario) {
        const t = await db.transaction();

        let campoUpdateOnDuplicate;

        if (cenario == "adicionar") {
            // se vier um item com um id ja existente na tabela, ele atualiza esses seguintes valores:
            campoUpdateOnDuplicate = [
                "valor_parcela",
                "valor_solicitado",
                "qtd_parcelas",
                "updatedAt",
                "ofertado"
            ]
        } else if (cenario == "atribuir_user") {
            campoUpdateOnDuplicate = [
                "usuario_id",
                "updatedAt"
            ]
        }

        try{
            const result = await ConsultasCLTPython.bulkCreate(data, { 
                transaction: t,

                // aqui define o que pode ser alterado se vier com um id igual (update na tabela)
                updateOnDuplicate: campoUpdateOnDuplicate
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

    async searchPagination(pesquisa, limite, offset, filtroAtribuido, filtroUserId) {
        const where = {}

        // pesquisa na tabela clientes q é FK
        if (pesquisa) {
            where['$cliente.cpf$'] = {
                [Op.like]: `%${pesquisa}%`       
            };
        }

        // se filtro atribuido for true, pesquisa pelos registros em que usuario id n seja null
        if (filtroAtribuido == 1) {
            // busca onde não é nulo, mas com a linguagem do sequelize
            where.usuario_id = { [Op.ne]:null }
        } else {
            where.usuario_id = null;
        }

        if (filtroUserId != null) {
            where.usuario_id = filtroUserId
        }

        console.log(where)

        const result = await ConsultasCLTPython.findAndCountAll({
            where,
            include: [
                {
                    model: Clientes,
                    as: 'cliente',
                },
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: { exclude: ['password'] }
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