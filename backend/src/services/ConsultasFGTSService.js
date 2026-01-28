import ConsultasFGTSRepository from "../repositories/ConsultasFGTSRepository.js";
import VCTexServices from "./integrations/VCTexServices.js";

class ConsultasFGTSService {
    async FazerConsulta (data, userData) {
        try {
            const instituicao = data.instituicao;
        
            switch (instituicao) {
                case "VCTex":
                    await VCTexServices.Simulacao(data.cpf, userData.username);
                    break;
                default:
                    console.error("Instituição não encontrada");
                    break;
            }

        } catch (err) {
            throw err;
        }
    }

    async RecuperarConsultas(pesquisa, page, limit) {
        try {
            const offset = (page - 1) * limit;

            const result = await ConsultasFGTSRepository.SearchPagination(pesquisa, limit, offset);

            return result;
        } catch {
            throw err;
        }
    }
}

export default new ConsultasFGTSService();