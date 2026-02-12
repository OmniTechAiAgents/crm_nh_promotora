import Consultas_lote from "../models/Consultas_lote.js";

class ConsultasLoteRepository {
    async create(data) {
        return Consultas_lote.create(data);
    }
}

export default new ConsultasLoteRepository();