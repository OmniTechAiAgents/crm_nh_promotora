import axios from 'axios';
import HttpException from "../utils/HttpException.js";
import V8CLTService from './integrations/V8CLTService.js';
import C6Service from './integrations/C6Service.js';
import NossaFintechService from './integrations/NossaFintechService.js';

class ConsultasCLTService {
    async ConsultarVinculoMargemTabela(cpf, instituicao) {
        try {
            let response;

            // decide para qual API vai mandar
            switch (instituicao){
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

    async RecuperarBancarizadoras(instituicao) {
        try {
            let response;
console.log(instituicao);
            switch (instituicao) {
                case "Nossa fintech":
                    response = await NossaFintechService.RecuperarBancarizadoras();
                    break;
                default:
                    throw new HttpException("Instituição não encontrada", 404);
            }

            return { 
                bancarizadoras_disponiveis: response 
            };
        } catch(err) {
            throw err;
        }
    }

    async GerarTermoAutorizacaoDataPrev(cpf, instituicao) {
        try {
            let response;

            // decide para qual API vai mandar
            switch (instituicao){
                case "Nossa fintech":
                    response = await NossaFintechService.GerarTermoAutorizacao(cpf);
                    break;
                default: 
                    throw new HttpException("Instituição não encontrada", 404);
            }

            return { link: response };
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