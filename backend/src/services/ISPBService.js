import ISPBRepository from "../repositories/ISPBRepository.js";

class ISPBService {
    async PesquisarBanco (pesquisa, limit) {
        try {
            return await ISPBRepository.SearchPagination(pesquisa, limit);
        } catch (err) {
            throw err;
        }
    }
}

export default new ISPBService();