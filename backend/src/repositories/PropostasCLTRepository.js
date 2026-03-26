import Tabela_propostas_CLT from "../models/Tabela_propostas_CLT.js";
import { Op } from 'sequelize';
import Usuario from "../models/Usuario.js";

class PropostasCLTRepository {
    async create(data) {
        return Tabela_propostas_CLT.create(data);
    }

    async SearchPagination(pesquisa, limite, offset, filtroUserId) {
        const where = {};

        if (pesquisa) {
            where[Op.or] = [
                { cpf: { [Op.like]: `%${pesquisa}%` } }
            ]
        }

        if (filtroUserId != null) {
            where.usuario_id = filtroUserId
        }

        const result = await Tabela_propostas_CLT.findAndCountAll({
            where,
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: { exclude: ['password'] }
                }
            ],
            limit: limite,
            offset,
            order: [['createdAt', 'DESC']]
        })

        return {
            data: result.rows,
            totalPages: Math.ceil(result.count / limite)
        }
    }
}

export default new PropostasCLTRepository();