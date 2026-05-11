import Cpfs_individuais from '../models/Cpfs_individuais.js';
import { Op } from 'sequelize';
import Usuario from "../models/Usuario.js";
import Clientes from '../models/Clientes.js';

class ConsultasFGTSRepository {
    async Create(data) {
        return Cpfs_individuais.create(data);
    }

    async SearchByFinancialId(financialId) {
        return Cpfs_individuais.findOne({
            where: {
                chave: financialId
            }
        })
    }

    async SearchPagination(pesquisa, limite, offset, filtroUserId, filtroElegivelProposta) {
        const where = {};
        const whereCliente = {};

        // add pesquisa se tiver (opcional do usuario);
        if (pesquisa) {
            whereCliente.cpf = { [Op.like]: `%${pesquisa}%` };
        }

        if (filtroUserId != null) {
            where.usuario_id = filtroUserId
        }

        if (filtroElegivelProposta != null) {
            where.elegivelProposta = filtroElegivelProposta
        }

        const result = await Cpfs_individuais.findAndCountAll({
            where,
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: { exclude: ['password'] }
                },
                {
                    model: Clientes,
                    as: "cliente",

                    // so passa o where se tiver conteúdo
                    ...(Object.keys(whereCliente).length > 0 && { where: whereCliente })
                }
            ],
            limit: limite,
            offset,
            order: [['id_consulta_lote', 'DESC']]
        });

        return {
            data: result.rows,
            totalPages: Math.ceil(result.count / limite)
        }
    }

    async SearchDuplicates(cpf, banco, API) {
        return Cpfs_individuais.findOne({
            where: {
                banco,
                API
            },
            include: [
                {
                    model: Clientes,
                    as: "cliente",
                    where: {
                        cpf: cpf
                    }
                }
            ]
        })
    }

    async Update(id, data) {
        return Cpfs_individuais.update(
            data,
            {
                where: {
                    id
                }
            }
        )
    }

    async UpdateByFinancialId(financialId, data) {
        return Cpfs_individuais.update(
            data,
            {
                where: {
                    chave: financialId
                }
            }
        )
    }

    async MarcarConsultaInelegivel(id, mensagem) {
        return Cpfs_individuais.update(
            {
                mensagem,
                elegivelProposta: false
            },
            {
                where: { id }
            }
        )
    }


    // reatribuição de lote
    async UpdatePromotorIdByConsultaLoteId(id_consulta_lote, usuario_id) {
        return Cpfs_individuais.update(
            {usuario_id},
            {
                where: {
                    id_consulta_lote: id_consulta_lote
                }
            }
        )
    }
}

export default new ConsultasFGTSRepository();