import Tabela_propostas from "../models/Tabela_propostas.js";
import { Op } from 'sequelize';
import Usuario from "../models/Usuario.js";

class PropostasRepository {
    async create(data) {
        return Tabela_propostas.create(data);
    }

    async findOne(proposalId) {
        return Tabela_propostas.findOne({
            where: {
                proposal_id: proposalId
            }
        })
    }

    async update(proposalId, data) {
        return Tabela_propostas.update(
            data,
            {
                where: {
                    proposal_id: proposalId
                }
            }
        );
    }

    async findAllParaVerificar(instituicao) {
        return Tabela_propostas.findAll({
            where: {
                API: instituicao,
                verificar: true
            },
            attributes: ['proposal_id', 'numero_contrato'],
            raw: true
        });
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

        const result = await Tabela_propostas.findAndCountAll({
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
        });

        return {
            data: result.rows,
            totalPages: Math.ceil(result.count / limite)
        }
    }

    async getApiByProposalId(proposalId) {
        return Tabela_propostas.findOne({
            where: {
                proposal_id: proposalId
            },
            attributes: ['API'],
            raw: true
        })
    }
}

export default new PropostasRepository();