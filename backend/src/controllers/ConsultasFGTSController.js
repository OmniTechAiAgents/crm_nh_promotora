import ConsultasFGTSService from "../services/ConsultasFGTSService.js";
import VCTexServices from "../services/integrations/VCTexServices.js";

class ConsultasFGTSController {
    async FazerConsulta (req, res) {
        try {
            const { instituicao, cpf } = req.body;
            // instituicao = VCtex, Nossa Fintech....

            const objConsulta = {
                instituicao,
                cpf
            }
            
            // service recebe o obj da consulta e fica responsavel por toda a logica dela
            await ConsultasFGTSService.FazerConsulta(objConsulta, req.user);
 
            return res.status(200).json({ msg: "dados recebidos com sucesso" });
        } catch (err) {
            return res.status(500).json({ erro: err.message });
        }
    }
}

export default new ConsultasFGTSController();