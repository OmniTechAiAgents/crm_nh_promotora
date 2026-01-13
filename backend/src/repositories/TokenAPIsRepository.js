import TokenAPIs from "../models/TokenAPIs.js";

class TokenAPIsRepository {
    async findOneByNameAndType(nome_api, tipo_api) {
        return TokenAPIs.findOne({ 
            where: {
                nome_api: nome_api,
                tipo_api: tipo_api
            } 
        })
    }

    async create(data) {
        return TokenAPIs.create(data);
    }

    async update(id, data) {
        return TokenAPIs.update(data, {
            where: { id: id }
        })
    };
}

export default new TokenAPIsRepository();