import { validarBodyAtribuirConsultasCLTPython } from "../middleware/validarBodyAtribuirConsultasCLTPython.js";
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

    async RecuperarConsultas(req, res) {
        try {
            const pesquisa = req.query.pesquisa;
            const page = parseInt(req.query.pagina) || 1;
            const limit = parseInt(req.query.limite) || 10;
            const atribuido = req.query.atribuido || null;

            const response = await ConsultasCLTPythonService.recuperarConsultas(page, limit, pesquisa, atribuido, req.user);

            if (!response.data || response.data.length == 0) {
                return res.status(204).send();
            }

            return res.status(200).json(response);
        } catch(err) {
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

    async AtribuirConsultas(req, res) {
        try {
            const dados = validarBodyAtribuirConsultasCLTPython.parse(req.body);

            await ConsultasCLTPythonService.atribuirConsultasAUsuario(dados);

            return res.status(200).json({ msg: "Consultas atribuídas com sucesso!" });
        } catch(err) {
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