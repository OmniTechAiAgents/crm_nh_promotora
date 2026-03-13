import Tabela_propostas_CLT from "../models/Tabela_propostas_CLT.js";
import Usuario from "../models/Usuario.js";

class PropostasCLTRepository {
    async create(data) {
        return Tabela_propostas_CLT.create(data);
    }
}

export default new PropostasCLTRepository();