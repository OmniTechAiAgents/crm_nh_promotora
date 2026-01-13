class ConsultasFGTSService {
    async FazerConsulta (data) {
        const instituicao = data.instituicao;
        
        switch (instituicao) {
            case "VCTex":
                console.log("Rodando logica da VCTex");
                break;
            default:
                console.error("Instituição não encontrada");
                break;
        }


        return true;
    }
}

export default new ConsultasFGTSService();