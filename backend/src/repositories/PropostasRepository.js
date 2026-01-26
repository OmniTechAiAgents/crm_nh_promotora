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
}

export default new PropostasRepository();