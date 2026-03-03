import { ValidarBodyCliente } from "../middleware/ValidarBodyCliente.js";
import ClientesService from "../services/ClientesService.js";
import HttpException from "../utils/HttpException.js";
import { ZodError } from "zod";
import NovaVidaService from '../services/integrations/NovaVidaService.js';

class ClientesController {
    async CriarClienteDB(req, res) {
        try {
            const { nome, cpf, data_nasc, celular } = ValidarBodyCliente.parse(req.body);

            const clienteExiste = await ClientesService.procurarCpf(cpf);
            if (clienteExiste) {
                throw new HttpException("Esse cliente já existe no banco de dados.", 409);
            }

            const clienteBody = ({
                nome,
                cpf,
                data_nasc,
                celular
            })
            
            const response = await ClientesService.criarClienteDB(clienteBody);

            return res.status(200).json(response);
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

    async BuscarClientePorCpf(req,res) {
        try {
            const cpf = req.query.cpf;

            const resultBuscaCliente = await ClientesService.procurarCpf(cpf); 
            if (!resultBuscaCliente || resultBuscaCliente?.length === 0) {
                const dadosCliente = await NovaVidaService.BuscarDados(cpf);

                if(dadosCliente.CONSULTA == "Não Autorizado") {
                    throw new HttpException("Não foi possível recuperar os dados do cliente na API do Nova Vida, será necessário fazer o cadastro do cliente manualmente.", 424);
                }

                await ClientesService.criarClienteNovaVida(dadosCliente, cpf);
            }

            // to re-consultando para garantir a integridade
            const response = await ClientesService.procurarCpf(cpf); 
            return res.status(200).json(response);
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

export default new ClientesController();