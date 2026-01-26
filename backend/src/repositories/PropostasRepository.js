import Tabela_propostas from "../models/Tabela_propostas.js";

class PropostasRepository {
    async create(data) {
        return Tabela_propostas.create(data);
    }
}

export default new PropostasRepository();