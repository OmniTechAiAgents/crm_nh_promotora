import NossaFintechService from "./integrations/NossaFintechService.js";
import VCTexServices from "./integrations/VCTexServices.js";
import PropostasRepository from "../repositories/PropostasRepository.js";

class PropostasFGTSService {
    async FazerProposta(data, userData) {
        try {
            const instituicao = data.instituicao;
                    
            switch (instituicao) {
                case "VCTex":
                    await VCTexServices.Proposta(data, userData.username);
                    break;
                case "Nossa fintech":
                    await NossaFintechService.Proposta(data, userData.username);
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
            await VCTexServices.CancelarProposta(proposalId, userData);
        } catch(err) {
            throw err;
        }
    }

    async VerificarProposta(proposalId) {
        try {
            await VCTexServices.VerificarApenasUmaProposta(proposalId);
        } catch(err) {
            throw err;
        }
    }
}

export default new PropostasFGTSService();