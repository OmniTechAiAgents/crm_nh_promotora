import { ValidarBodyConsultaCLT } from "../middleware/ValidarBodyConsultaCLT.js";
import ConsultasCLTService from "../services/ConsultasCLTService.js";
import HttpException from "../utils/HttpException.js";

class ConsultasCLTController {
    async GerarTermoAutorizacaoDataPrev(req, res) {
        try {
            const dados = ValidarBodyConsultaCLT.parse(req.body);

            const response = await ConsultasCLTService.GerarTermoAutorizacaoDataPrev(dados.cpf, dados.instituicao);

            return res.status(200).json(response);
        } catch(err) {
            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message })
            }

            return res.status(500).json({ erro: err.message });
        }
    }

    async ConsultarVinculo(req, res) {
        try {
            const dados = ValidarBodyConsultaCLT.parse(req.body);

            const response = await ConsultasCLTService.ConsultarVinculo(dados.cpf, dados.instituicao);

            return res.status(200).json(response);
        } catch (err) {
            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message })
            }

            return res.status(500).json({ erro: err.message });
        }
    }
}

export default new ConsultasCLTController();