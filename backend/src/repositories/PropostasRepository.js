import Tabela_propostas from "../models/Tabela_propostas.js";

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

    async findAllParaVerificar() {
        return Tabela_propostas.findAll({
            where: {
                verificar: true
            },
            attributes: ['proposal_id', 'numero_contrato'],
            raw: true
        });
    }
}

export default new PropostasRepository();