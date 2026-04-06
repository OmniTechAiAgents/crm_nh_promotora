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

    async findOneByProposalId(proposalId) {
        return Tabela_propostas_CLT.findOne({
            where: {
                id_proposta: proposalId
            }
        })
    }

    async updateByProposalId(proposalId, data) {
        return Tabela_propostas_CLT.update(
            data,
            {
                where: {
                    id_proposta: proposalId
                }
            }
        );
    }

    async findAllParaVerificar(instituicao) {
        return Tabela_propostas_CLT.findAll({
            where: {
                API: instituicao,
                verificar: true
            },
            attributes: ['id_proposta'],
            raw: true
        });
    }
}

export default new PropostasCLTRepository();