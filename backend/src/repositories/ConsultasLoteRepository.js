import Consultas_lote from "../models/Consultas_lote.js";
import Usuario from "../models/Usuario.js";
import Cpfs_individuais from "../models/Cpfs_individuais.js";

class ConsultasLoteRepository {
    async create(data) {
        return Consultas_lote.create(data);
    }

    async update(consultaId, data) {
        return Consultas_lote.update(
            data,
            {
                where: {
                    id: consultaId
                }
            }
        )
    }

    async findOneConsultaById(consultaId) {
        return Consultas_lote.findOne({ where: { id: consultaId } });
    }

    async SearchPagination(pesquisa, limite, offset) {
        const where = {};

        // add pesquisa se tiver (opcional do usuario);
        if (pesquisa) {
            where[Op.or] = [
                { createdAt: { [Op.like]: `%${pesquisa}%` } }
            ]
        }

        const result = await Consultas_lote.findAndCountAll({
            where,

            attributes: {
                exclude: ['id_admin', 'id_promotor']
            },

            include: [
                {
                    model: Usuario,
                    as: 'admin',
                    attributes: { exclude: ['password'] }
                },
                {
                    model: Usuario,
                    as: 'promotor',
                    attributes: { exclude: ['password'] }
                },
                {
                    model: Cpfs_individuais,
                    as: 'consultas',
                    where: {
                        elegivelProposta: 1
                    },
                    required: false // MUITO importante
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
}

export default new ConsultasLoteRepository();