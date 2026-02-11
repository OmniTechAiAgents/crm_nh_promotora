import NossaFintechService from "./integrations/NossaFintechService.js";
import VCTexServices from "./integrations/VCTexServices.js";
import PropostasRepository from "../repositories/PropostasRepository.js";
import HttpException from "../utils/HttpException.js";
import AuthService from "./AuthService.js";

class PropostasFGTSService {
    async FazerProposta(data, userData) {
        try {
            const instituicao = data.instituicao;
                    
            switch (instituicao) {
                case "VCTex":
                    await VCTexServices.Proposta(data, userData.id);
                    break;
                case "Nossa fintech":
                    await NossaFintechService.Proposta(data, userData.id);
                    break;
                default:
                    console.error("Instituição não encontrada");
                    break;
            }
        } catch (err) {
            throw err;
        }
    }

    async RecuperarPropostas(pesquisa, page, limit) {
        try {
            const offset = (page - 1) * limit;
    
            const result = await PropostasRepository.SearchPagination(pesquisa, limit, offset);
    
            return result;
        } catch {
            throw err;
            }
    }

    async CancelarProposta(proposalId, userData) {
        try {
            const api = await PropostasRepository.getApiByProposalId(proposalId);
            if(api == null) {
                throw new HttpException("Proposta não encontrada", 404);
            }

            let response = null;

            switch (api.API) {
                case "VCTex":
                    response = await VCTexServices.CancelarProposta(proposalId, userData);
                    break;
                case "Nossa fintech":
                    response = await NossaFintechService.CancelarProposta(proposalId, userData);
                    break
                default:
                    console.error("Instituição não encontrada");
                    break;
            }

            const usuarioRaw = await AuthService.BuscarUsuarioPorId(response.usuario_id);
            const usuario_data = {
                id: usuarioRaw.dataValues.id,
                username: usuarioRaw.dataValues.username,
                role: usuarioRaw.dataValues.role
            }

            const { usuarioId, ...dadosProposta } = response.dataValues;

            return {
                ...dadosProposta,
                usuario: usuario_data
            };
        } catch(err) {
            throw err;
        }
    }

    async VerificarProposta(proposalId) {
        try {
            const api = await PropostasRepository.getApiByProposalId(proposalId);
            if(api == null) {
                throw new HttpException("Proposta não encontrada", 404);
            }

            let response = null;

            switch (api.API) {
                case "VCTex":
                    response = await VCTexServices.VerificarApenasUmaProposta(proposalId);
                    break;
                case "Nossa fintech":
                    response = await NossaFintechService.VerificarApenasUmaProposta(proposalId);
                    break
                default:
                    console.error("Instituição não encontrada");
                    break;
            }

            // recuperando e tratando dados do usuário
            const usuarioRaw = await AuthService.BuscarUsuarioPorId(response.usuario_id);
            const usuario_data = {
                id: usuarioRaw.dataValues.id,
                username: usuarioRaw.dataValues.username,
                role: usuarioRaw.dataValues.role
            }

            const { usuarioId, ...dadosProposta } = response.dataValues;

            return {
                ...dadosProposta,
                usuario: usuario_data
            };
        } catch(err) {
            throw err;
        }
    }
}

export default new PropostasFGTSService();