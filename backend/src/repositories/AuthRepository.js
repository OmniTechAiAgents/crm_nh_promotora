import Usuario from "../models/Usuario.js";
import { Op } from 'sequelize';

class AuthRepository {
    async create(data) {
        return Usuario.create(data);
    }

    async findOneByUsername(username) {
        return Usuario.findOne({ where: { username } });
    }

    async findOneById(id) {
        return Usuario.findOne({ where: { id } });
    }

    async SearchPagination(pesquisa, limite, offset) {
        const where = {};

        if (pesquisa) {
            where[Op.or] = [
                { username: { [Op.like]: `%${pesquisa}%` } }
            ]
        }

        const result = await Usuario.findAndCountAll({
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

    async update(usuarioId, data) {
        return Usuario.update(
            data,
            {
                where: {
                    id: usuarioId
                }
            }
        )
    }

    async delete(usuarioId) {
        return Usuario.destroy({
            where: {
                id: usuarioId
            }
        })
    }
}

export default new AuthRepository();