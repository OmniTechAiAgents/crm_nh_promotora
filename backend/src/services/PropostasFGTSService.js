import VCTexServices from "./integrations/VCTexServices.js";

class PropostasFGTSService {
    async FazerProposta(data, userData) {
        try {
            const instituicao = data.instituicao;
                    
            switch (instituicao) {
                case "VCTex":
                    await VCTexServices.Proposta(data, userData.username);
                    break;
                default:
                    console.error("Instituição não encontrada");
                    break;
            }
        } catch (err) {
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
}

export default new PropostasFGTSService();