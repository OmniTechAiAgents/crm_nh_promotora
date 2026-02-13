import ConsultasFGTSService from "../services/ConsultasFGTSService.js";
import AuthService from "../services/AuthService.js";
import HttpException from "../utils/HttpException.js";

class MicroservicesController {
    async Consultar(req, res) {
        try {
            const { id_promotor, cpf, instituicao } = req.body;

            // recupera todas as informações do promotor a quem foi atribuido a consulta
            const usuario = await AuthService.BuscarUsuarioPorId(id_promotor);
            if(!usuario) {
                throw new HttpException("Usuário não encontrado", 404)
            }

            const bodyConsulta = ({
                cpf: cpf,
                instituicao: instituicao
            })

            // chama a função de consulta FGTS no service de FGTS
            const consulta = await ConsultasFGTSService.FazerConsulta(bodyConsulta, usuario)

            return res.status(200).json(consulta);
        } catch (err) {
            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }
        }
    }
}

export default new MicroservicesController();