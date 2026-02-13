import Consultas_lote from "../models/Consultas_lote.js";

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
}

export default new ConsultasLoteRepository();