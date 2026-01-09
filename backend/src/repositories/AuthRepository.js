import Usuario from "../models/Usuario.js";

class AuthRepository {
    async create(data) {
        return Usuario.create(data);
    }

    async findOneByUsername(username) {
        return Usuario.findOne({ where: { username } });
    }
}

export default new AuthRepository();