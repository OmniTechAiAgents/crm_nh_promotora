import Cpfs_individuais from '../models/Cpfs_individuais.js';

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
}

export default new ConsultasFGTSRepository();