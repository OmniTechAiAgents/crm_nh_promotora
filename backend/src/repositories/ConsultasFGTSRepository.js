import Cpfs_individuais from '../models/Cpfs_individuais.js';
import { Op } from 'sequelize';

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

    async SearchPagination(pesquisa, limite, offset) {
        const where = {};

        // add pesquisa se tiver (opcional do usuario);
        if (pesquisa) {
            where[Op.or] = [
                { cpf: { [Op.like]: `%${pesquisa}%` } }
            ]
        }

        const result = await Cpfs_individuais.findAndCountAll({
            where,
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

export default new ConsultasFGTSRepository();