import ConsultasFGTSService from "../services/ConsultasFGTSService.js";
import VCTexServices from "../services/integrations/VCTexServices.js";
import HttpException from "../utils/HttpException.js";

class ConsultasFGTSController {
    async FazerConsulta (req, res) {
        try {
            const { instituicao, cpf } = req.body;
            // instituicao = VCtex, Nossa Fintech....

            const objConsulta = {
                instituicao,
                cpf
            }
            
            await ConsultasFGTSService.FazerConsulta(objConsulta, req.user);
 
            return res.status(200).json({ msg: "dados recebidos com sucesso" });
        } catch (err) {
            console.log("Erro no FGTS controller disparado")
            if (err instanceof HttpException) {
                console.log("Erro no catch erro no instance of de HttpException disparado.");
                return res.status(err.status).json({ erro: err.message });
            }

            return res.status(500).json({ erro: err.message });
        }
    }
}

export default new ConsultasFGTSController();