import ClientesRepository from "../repositories/ClientesRepository.js";
import NovaVidaService from "./integrations/NovaVidaService.js";
import ParseNascNV from "../utils/ParseNascNV.js";

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


}

export default new ClientesService();