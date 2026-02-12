import ClientesRepository from "../repositories/ClientesRepository.js";
import NovaVidaService from "./integrations/NovaVidaService.js";
import ParseNascNV from "../utils/ParseNascNV.js";
import HttpException from "../utils/HttpException.js";

class ClientesService {
    async procurarCpf(cpf) {
        try {
            const consultaDB = await ClientesRepository.findOneByCpf(cpf);
        
            return consultaDB;
        } catch (err) {
            throw err;
        }
    }

    async criarClienteNovaVida(data, cpf) {
        try {
            // tratamento do campo DATA_NASC
            const DataFormatada = ParseNascNV(data.CONSULTA.CADASTRO.NASC);

            const clienteObj = ({
                cpf: cpf,
                nome: data.CONSULTA.CADASTRO.NOME,
                data_nasc: DataFormatada,
                celular: (`${data.CONSULTA.CELULARES.CELULAR[0].DDDCEL}${data.CONSULTA.CELULARES.CELULAR[0].CEL}`),
            });

            const retorno = await ClientesRepository.create(clienteObj);

            return retorno;
        } catch(err) {
            throw err;
        }
    }

    async criarClienteDB(data) {
        try {
            const existe = await this.procurarCpf(data.cpf);
            if(existe) {
                throw new HttpException("Esse cliente já está registrado no banco de dados.", 409)
            }

            return await ClientesRepository.create(data);
        } catch (err) {
            throw err;
        }
    }
}

export default new ClientesService();