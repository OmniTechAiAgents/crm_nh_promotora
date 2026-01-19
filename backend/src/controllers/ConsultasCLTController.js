import ConsultasCLTService from "../services/ConsultasCLTService.js";
import VerifyCpfMask from "../utils/VerifyCpfMask.js";

class ConsultasCLTController {
    async FazerConsulta(req, res) {
        try {
            const { instituicao, cpf, prazo, valorParcela, valorDesembolso, valorSeguro, tabela } = req.body;
            // OBS: instituicao é a API que vai ser usada para fazer a consulta

            if (!cpf || VerifyCpfMask(cpf)) {
                return res.status(400).json({
                    erro: "CPF inválido. Envie apenas números."
                });
            }

            const objConsulta = {
                instituicao,
                cpf,
                prazo,
                valorParcela,
                valorDesembolso,
                valorSeguro,
                tabela
            };

            ConsultasCLTService.FazerConsulta(objConsulta);

            return res.status(200).json({ msg: "dados recebidos com sucesso" });
        } catch(err) {
            return res.status(500).json({ erro: err.message });
        }
    }
}

export default new ConsultasCLTController();