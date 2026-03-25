import PropostasCLTService from "../services/PropostasCLTService.js";
import { ZodError } from "zod";
import HttpException from "../utils/HttpException.js";
import { ValidarBodyPropostaCLT } from "../middleware/ValidarBodyPropostaCLT.js";

class PropostasCLTController {
    async DigitarPropostas (req, res) {
        try {
            const dados = ValidarBodyPropostaCLT.parse(req.body)

            await PropostasCLTService.DigitarProposta(dados, dados.instituicao, req.user);

            return res.status(200).json({ msg: "Proposta criada com sucesso!" })
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

    async RecuperarPropostas (req, res) {
        try {
            const pesquisa = req.query.pesquisa;
            const page = parseInt(req.query.pagina) || 1;
            const limit = parseInt(req.query.limite) || 10;

            const response = await PropostasCLTService.RecuperarPropostas(pesquisa, page, limit, req.user);

            if (!response.data || response.data.length == 0) {
                return res.status(204).send();
            }

            return res.status(200).send();
        } catch (err) {
            console.log(err)

            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            return res.status(500).json({ erro: err.message });
        }
    }
}

export default new PropostasCLTController();