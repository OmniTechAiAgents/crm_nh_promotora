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
            
            const resultado = await ConsultasFGTSService.FazerConsulta(objConsulta, req.user);
 
            return res.status(200).json(resultado);
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

    async RecuperarConsultas (req, res) {
        try {
            // tenta recuperar page e limit do req, se nao seta valores padroes para 1 e 10;
            const pesquisa = req.query.pesquisa;
            const page = parseInt(req.query.pagina) || 1;
            const limit = parseInt(req.query.limite) || 10;

            const response = await ConsultasFGTSService.RecuperarConsultas(pesquisa, page, limit, req.user);

            if (!response.data || response.data.length == 0) {
                return res.status(204).send();
            }

            return res.status(200).json( response );
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

    async IniciarConsultaEmLote (req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ erro: "É preciso enviar um arquivo .csv para inciar a operação." });
            }

            console.log(`Nome do arquivo: ${req.file.filename}`)

            return res.status(200).json({ msg: "foi, hehe" });
        } catch(err) {
            return res.status(500).json({ erro: err })
        }
    }
}

export default new ConsultasFGTSController();