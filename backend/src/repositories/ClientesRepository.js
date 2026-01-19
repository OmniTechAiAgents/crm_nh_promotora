import Clientes from "../models/Clientes.js";

class ClientesRepository {
    async findOneByCpf(cpf) {
        return Clientes.findOne({
            where: {
                cpf
            }
        });
    }

    async create(data) {
        return Clientes.create(data);
    }
}

export default new ClientesRepository();