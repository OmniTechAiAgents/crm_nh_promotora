import HttpException from "../utils/HttpException.js";
import PresencaBankService from "./integrations/PresencaBankService.js";

class PropostasCLTService {
    async DigitarProposta(data, instituicao, userData) {
        try {
            let response;

            switch (instituicao) {
                case "Presenca bank":
                    response = await PresencaBankService.DigitarProposta(data, userData.id);
                    break;
                default:
                    throw new HttpException("Instituição não encontrada", 404);
            }
            
            return response;
        } catch (err) {
            throw err;
        }
    }
}

export default new PropostasCLTService();