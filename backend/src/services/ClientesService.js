import ClientesRepository from "../repositories/ClientesRepository.js";
import NovaVidaService from "./integrations/NovaVidaService.js";
import ParseNascNV from "../utils/ParseNascNV.js";

class ClientesService {
    async procurarCpf(cpf) {
        try {
            const consultaDB = await ClientesRepository.findOneByCpf(cpf);
            
            if (consultaDB) {
                return consultaDB;
            }

            // busca os dados com a API da NovaVida
            const dadosCliente = await NovaVidaService.BuscarDados(cpf);

            // armazena novos dados no banco
            await this.criarCliente(dadosCliente, cpf);

            // retornando a busca do banco para padronizar a formatacao de retorno
            const resultado = await ClientesRepository.findOneByCpf(cpf);

            return resultado;
        } catch (err) {
            throw err;
        }
    }

    async criarCliente(data, cpf) {
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