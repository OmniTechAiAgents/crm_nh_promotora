import ClientesRepository from "../repositories/ClientesRepository.js";
import ParseNascNV from "../utils/ParseNascNV.js";
import HttpException from "../utils/HttpException.js";
import SepararDDDTelefone from "../utils/SepararDDDTelefone.js";

class ClientesService {
    async procurarCpf(cpf) {
        try {
            const consultaDB = await ClientesRepository.findOneByCpf(cpf);
        
            return consultaDB;
        } catch (err) {
            throw err;
        }
    }

    async criarClienteLemit(data, cpf) {
        try {
            const DataFormatada = data.pessoa.data_nascimento.substring(0, 10);

            const clienteObj = ({
                provider: "Lemit",
                cpf: cpf,
                nome: data.pessoa.nome,
                data_nasc: DataFormatada,
                celular: data.pessoa.celulares,
                sexo: data.pessoa.sexo,
                nome_mae: data.pessoa.nome_mae,
                falecido: data.pessoa.falecido,
                situacao_cpf: data.pessoa.situacao_cpf,
                renda: data.pessoa.renda,
                ocupacao: data.pessoa.ocupacao,
                emails: data.pessoa.emails,
                enderecos: data.pessoa.enderecos,
                carros: data.pessoa.carros,
                vinculos: data.pessoa.vinculos,
                risco_credito: data.pessoa.risco_credito
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

            // usa função para separar o ddd do telefone para o novo body de cliente no db
            const newCelularBody = SepararDDDTelefone(data.celular);

            const bodyClienteV2 = ({
                ...data,

                celular: newCelularBody
            })
        
            return await ClientesRepository.create(bodyClienteV2);
        } catch (err) {
            throw err;
        }
    }

    async editarClienteDBUsandoDadosLemit(data, cpf) {
        try {
            const DataFormatada = data.pessoa.data_nascimento.substring(0, 10);

            const clienteObj = ({
                provider: "Lemit",
                cpf: cpf,
                nome: data.pessoa.nome,
                data_nasc: DataFormatada,
                celular: data.pessoa.celulares,
                sexo: data.pessoa.sexo,
                nome_mae: data.pessoa.nome_mae,
                falecido: data.pessoa.falecido,
                situacao_cpf: data.pessoa.situacao_cpf,
                renda: data.pessoa.renda,
                ocupacao: data.pessoa.ocupacao,
                emails: data.pessoa.emails,
                enderecos: data.pessoa.enderecos,
                carros: data.pessoa.carros,
                vinculos: data.pessoa.vinculos,
                risco_credito: data.pessoa.risco_credito
            });

            await ClientesRepository.updateByCpf(cpf, clienteObj);
        } catch (err) {
            throw err;
        }
    }
}

export default new ClientesService();