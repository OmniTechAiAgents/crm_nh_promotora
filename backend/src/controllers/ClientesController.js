import { ValidarBodyCliente } from "../middleware/ValidarBodyCliente.js";
import ClientesService from "../services/ClientesService.js";
import HttpException from "../utils/HttpException.js";
import { ZodError } from "zod";
import LemitService from '../services/integrations/LemitService.js';

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
                const dadosCliente = await LemitService.BuscarDados(cpf);
                await ClientesService.criarClienteLemit(dadosCliente, cpf);
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

    async BuscarClienteDBeConsultarLemit(req, res) {
        try {
            const { cpf } = req.body;

            const resultBuscaCliente = await ClientesService.procurarCpf(cpf); 
            if (!resultBuscaCliente || resultBuscaCliente?.length === 0) {
                const dadosCliente = await LemitService.BuscarDados(cpf);
                await ClientesService.criarClienteLemit(dadosCliente, cpf);
            }
            
            const cliente = await ClientesService.procurarCpf(cpf);

            return res.status(200).json(cliente.dataValues);
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

    async AtualizarClienteDBViaLemit(req, res) {
        try {
            const { cpf } = req.params;

            // primeiro verifica se o cpf realmente existe no nosso DB
            const clienteExistente = await ClientesService.procurarCpf(cpf); 
            if(!clienteExistente || clienteExistente?.length === 0) {
                throw new HttpException("Esse cliente não existe no nosso banco de dados", 409);
            }

            const dadosCliente = await LemitService.BuscarDados(cpf);
            await ClientesService.editarClienteDBUsandoDadosLemit(dadosCliente, cpf);

            return res.status(200).json({ msg: "As informações do cliente foram atualizadas com sucesso com base na API do Lemit." })
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