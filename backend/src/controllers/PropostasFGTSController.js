import { ValidarBodyProposta } from "../middleware/ValidarBodyProposta.js";
import HttpException from "../utils/HttpException.js";
import { ZodError } from "zod";

class PropostasFGTSController {
    async FazerProposta (req, res) {
        try {
            const dados = ValidarBodyProposta.parse(req.body)
            
            return res.status(200).json({
                message: 'Body de proposta válida',
                dados
            });
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    erro: err.issues[0].message
                });
            }

            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            return res.status(500).json({ erro: err.message });
        }
    }
}

export default new PropostasFGTSController();