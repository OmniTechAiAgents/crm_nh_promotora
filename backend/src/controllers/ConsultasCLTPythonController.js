import { ValidarBodyConsultasCLTPython } from "../middleware/ValidarBodyConsultasCLTPython.js";
import ConsultasCLTPythonService from "../services/ConsultasCLTPythonService.js";
import HttpException from "../utils/HttpException.js";
import { ZodError } from "zod";

class ConsultasCLTPythonController {
    async ArmazenarConsultas (req, res) {
        try {
            const dados = ValidarBodyConsultasCLTPython.parse(req.body);

            await ConsultasCLTPythonService.armazenarConsultas(dados.consultas, dados.instituicao);

            return res.status(200).json({ msg: "Armazenamento de consultas concluído com sucesso!" });
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

export default new ConsultasCLTPythonController();