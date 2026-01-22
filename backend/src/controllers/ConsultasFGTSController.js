import ConsultasFGTSService from "../services/ConsultasFGTSService.js";
import HttpException from "../utils/HttpException.js";
import { ValidarBodyConsulta } from "../middleware/ValidarBodyConsulta.js";
import { ZodError } from "zod";

class ConsultasFGTSController {
    async FazerConsulta (req, res) {
        try {
            const dados = ValidarBodyConsulta.parse(req.body)

            const objConsulta = {
                instituicao: dados.instituicao,
                cpf: dados.cpf
            }
            
            await ConsultasFGTSService.FazerConsulta(objConsulta, req.user);
 
            return res.status(200).json({ msg: "Consulta realizada com sucesso." });
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

export default new ConsultasFGTSController();