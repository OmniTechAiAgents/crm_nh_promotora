import Tabela_propostas from "../models/Tabela_propostas.js";
import { Op } from 'sequelize';
import Usuario from "../models/Usuario.js";
import Clientes from "../models/Clientes.js";

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
        const whereCliente = {};

        if (pesquisa) {
            whereCliente.cpf = { [Op.like]: `%${pesquisa}%` };
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