import PropostasCLTRepository from "../repositories/PropostasCLTRepository.js";
import HttpException from "../utils/HttpException.js";
import PresencaBankService from "./integrations/PresencaBankService.js";
import V8CLTService from "./integrations/V8CLTService.js";

class PropostasCLTService {
    async DigitarProposta(data, instituicao, userData) {
        try {
            let response;

            switch (instituicao) {
                case "Presenca bank":
                    response = await PresencaBankService.DigitarProposta(data, userData.id);
                    break;
                case "v8":
                    response = await V8CLTService.SimularECriarProposta(data, userData.id);
                    break;
                default:
                    throw new HttpException("Instituição não encontrada", 404);
            }
            
            return response;
        } catch (err) {
            throw err;
        }
    }

    async RecuperarPropostas(pesquisa, page, limit, userData) {
        try {
            const offset = (page - 1) * limit;

            // se for promotor, filtra para apenas as propostas dele, se for adm, pega todas as propostas
            const filtroUserId = userData.role == "promotor" ? userData.id : null;

            const result = await PropostasCLTRepository.SearchPagination(pesquisa, limit, offset, filtroUserId);

            return result
        } catch(err) {
            throw err;
        }
    }
}

export default new PropostasCLTService();