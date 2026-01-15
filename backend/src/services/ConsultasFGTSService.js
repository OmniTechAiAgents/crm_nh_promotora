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
}

export default new ConsultasFGTSService();