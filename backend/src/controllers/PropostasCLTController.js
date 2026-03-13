import PropostasCLTService from "../services/PropostasCLTService.js";
import { ZodError } from "zod";
import HttpException from "../utils/HttpException.js";
import { ValidarBodyPropostaCLT } from "../middleware/ValidarBodyPropostaCLT.js";

class PropostasCLTController {
    async DigitarPropostas (req, res) {
        try {
            const dados = ValidarBodyPropostaCLT.parse(req.body)

            await PropostasCLTService.DigitarProposta(dados, dados.instituicao, req.user);

            return res.status(200).json({ msg: "Proposta criada con sucesso!" })
        } catch (err) {
            console.log(err)

            if (err instanceof ZodError) {
                return res.status(400).json({
                    erro: err.issues[0].message
                });
            }

            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message })
            }

            return res.status(500).json({ erro: err.message });
        }
    }
}

export default new PropostasCLTController();