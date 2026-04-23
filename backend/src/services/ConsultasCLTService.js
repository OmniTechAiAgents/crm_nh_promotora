import axios from 'axios';
import HttpException from "../utils/HttpException.js";
import PresencaBankService from './integrations/PresencaBankService.js';
import V8CLTService from './integrations/V8CLTService.js';
import C6Service from './integrations/C6Service.js';

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
                case "v8":
                    response = await V8CLTService.GerarTermoSimularOperacao(cpf);
                    break;
                default: 
                    throw new HttpException("Instituição não encontrada", 404);
            }

            return response;
        } catch(err) {
            throw err;
        }
    }

    async GerarLinkFormalizacao(instituicao, cpf) {
        try {
            let response;

            switch(instituicao) {
                case "c6":
                    response = await C6Service.GerarLinkAutenticacaoCLT(cpf);
                    break;
                default:
                    throw new HttpException("Instituicao não encontrada", 404);
            }

            return response;
        } catch(err) {
            throw err;
        }
    }
}

export default new ConsultasCLTService();