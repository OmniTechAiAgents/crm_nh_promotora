import { ValidarBodyCliente } from "../middleware/ValidarBodyCliente.js";
import ClientesService from "../services/ClientesService.js";
import HttpException from "../utils/HttpException.js";

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
}

export default new ClientesController();