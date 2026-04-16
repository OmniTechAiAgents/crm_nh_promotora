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

    async updateByCpf(cpf, data) {
        return Clientes.update(
            data,
            {
                where: {
                    cpf
                }
            }
        )
    }
}

export default new ClientesRepository();