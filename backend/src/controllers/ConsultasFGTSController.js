import ConsultasFGTSService from "../services/ConsultasFGTSService.js";

class ConsultasFGTSController {
    async FazerConsulta (req, res) {
        try {
            const { instituicao, cpf, anuidades, saldo, tabela, usuario, chave, banco } = req.body;
            // instituicao = VCtex, Nossa Fintech....

            const objConsulta = {
                instituicao, 
                cpf, 
                anuidades, 
                saldo, 
                tabela, 
                usuario, 
                chave, 
                banco
            }
            
            // service recebe o obj da consulta e fica responsavel por toda a logica dela
            ConsultasFGTSService.FazerConsulta(objConsulta);
 
            return res.status(200).json({ msg: "dados recebidos com sucesso" });
        } catch (err) {
            return res.status(500).json({ erro: err.message });
        }
    }
}

export default new ConsultasFGTSController();