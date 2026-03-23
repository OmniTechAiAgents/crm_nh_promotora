import axios from 'axios';
import HttpException from "../utils/HttpException.js";
import PresencaBankService from './integrations/PresencaBankService.js';

class ConsultasCLTService {
    async GerarTermoAutorizacaoDataPrev(cpf, instituicao) {
        try {
            let response;

            // decide para qual API vai mandar
            switch (instituicao){
                case "Presenca bank":
                    response = await PresencaBankService.GerarTermoAutorizacao(cpf);
                    break;
                default: 
                    throw new HttpException("Instituição não encontrada", 404);
            }

            return response;
        } catch(err) {
            throw err;
        }
    }

    async ConsultarVinculoMargemTabela(cpf, instituicao) {
        try {
            let response;

            // decide para qual API vai mandar
            switch (instituicao){
                case "Presenca bank":
                    response = await PresencaBankService.ConsultarVinculoMargemTabela(cpf);
                    break;
                default: 
                    throw new HttpException("Instituição não encontrada", 404);
            }

            return response;
        } catch(err) {
            throw err;
        }
    }
}

export default new ConsultasCLTService();