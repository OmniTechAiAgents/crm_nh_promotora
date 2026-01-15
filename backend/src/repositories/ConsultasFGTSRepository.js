import Cpfs_individuais from '../models/Cpfs_individuais.js';

class ConsultasFGTSRepository {
    async Create(data) {
        return Cpfs_individuais.create(data);
    }
}

export default new ConsultasFGTSRepository();