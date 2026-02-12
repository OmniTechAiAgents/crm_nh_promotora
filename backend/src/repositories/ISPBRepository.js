import ISPB_consulta from "../models/ISPB_consulta.js";
import { Op } from 'sequelize';

class ISPBRepository {
    async findByCod(num_cod) {
        return ISPB_consulta.findOne({
            where: {num_cod},
            raw: true
        })
    }

    async SearchPagination(pesquisa, limit = 25) {
        let where = {};

        if (pesquisa) {
            where.banco = {
                [Op.like]: `%${pesquisa}%`
            };
        }

        return ISPB_consulta.findAll({
            where,
            limit,
            order: [
                ['banco', 'ASC']
            ]
        });
    }
}

export default new ISPBRepository();