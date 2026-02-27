import ConsultasFGTSService from "../services/ConsultasFGTSService.js";
import AuthService from "../services/AuthService.js";
import HttpException from "../utils/HttpException.js";
import ClientesService from "../services/ClientesService.js";
import { ZodError } from "zod";
import { ValidarBodyCliente } from "../middleware/ValidarBodyCliente.js";
import ConsultasLoteService from "../services/ConsultasLoteService.js";
import NovaVidaService from "../services/integrations/NovaVidaService.js";

class MicroservicesController {
    async Consultar(req, res) {
        try {
            const { id_promotor, cpf, instituicao, id_consulta_lote } = req.body;

            // recupera todas as informações do promotor a quem foi atribuido a consulta
            const usuario = await AuthService.BuscarUsuarioPorId(id_promotor);
            if(!usuario) {
                throw new HttpException("Usuário não encontrado", 404)
            }

            const bodyConsulta = ({
                cpf: cpf,
                instituicao: instituicao,
                id_consulta_lote: id_consulta_lote
            })

            // chama a função de consulta FGTS no service de FGTS
            const consulta = await ConsultasFGTSService.FazerConsulta(bodyConsulta, usuario)

            return res.status(200).json(consulta);
        } catch (err) {
            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            return res.status(500).json({ erro: err.message });
        }
    }

    async ProcurarClientePorCpf(req, res) {
        try {
            //validar com zod dps
            const cpf  = req.query.cpf;

            const result = await ClientesService.procurarCpf(cpf);

            if (!result || result?.length == 0 || result == null) {
                return res.status(204).send();
            }

            return res.status(200).json(result);
        } catch (err) {
            console.log(err)
            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            return res.status(500).json({ erro: err.message });
        }
    }

    async RegistrarNovoCliente(req, res) {
        try {
            const dados = ValidarBodyCliente.parse(req.body);

            // o corpo do objeto já é validado pelo zod, então não preciso re-validar

            const retornoDB = await ClientesService.criarClienteDB(dados);

            return res.status(201).json(retornoDB);
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

    async RegistrarClienteComNV(req, res) {
        try {
            const { cpf } = req.body;

            const clienteExistente = await ClientesService.procurarCpf(cpf);
            if (clienteExistente) {
                throw new HttpException("Esse cliente já existe no nosso banco de dados", 409);
            }

            const clienteNV = await NovaVidaService.BuscarDados(cpf);

            await ClientesService.criarClienteNovaVida(clienteNV, cpf);

            const response = await ClientesService.procurarCpf(cpf);

            return res.status(200).json(response)
        } catch(err) {
            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            return res.status(500).json({ erro: err.message });
        }
    }

    async EditarRegistroDeConsulta(req, res) {
        try {
            const { id, status, mensagem } = req.body;

            await ConsultasLoteService.Editar(id, status, mensagem)

            return res.status(200).json({ msg: "Status do registro de consulta editado com sucesso" })
        } catch (err) {
            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            return res.status(500).json({ erro: err.message });
        }
    }
}

export default new MicroservicesController();