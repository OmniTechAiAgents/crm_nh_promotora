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
                // parte cadastro
                // obs: usando o CPF da funcao pq as vezes a API manda errado e sem o 0 a esquerda (o retorno é integer)
                cpf: cpf,
                nome: data.CONSULTA.CADASTRO.NOME,
                nome_mae: data.CONSULTA.CADASTRO.NOME_MAE,
                sexo: data.CONSULTA.CADASTRO.SEXO,
                data_nasc: DataFormatada,

                // parte endereco
                cep: data.CONSULTA.ENDERECOS.ENDERECO.CEP,

                // parte celular
                celular_ddd: data.CONSULTA.CELULARES.CELULAR.DDDCEL,
                celular_numero: data.CONSULTA.CELULARES.CELULAR.CEL,
                celular_procon: data.CONSULTA.CELULARES.CELULAR.PROCON,
                celular_whatsapp: data.CONSULTA.CELULARES.CELULAR.FLWHATSAPP,

                // parte telefone
                telefone_ddd: data.CONSULTA.TELEFONES.TELEFONE.DDD,
                telefone_numero: data.CONSULTA.TELEFONES.TELEFONE.TELEFONE,
                telefone_procon: data.CONSULTA.TELEFONES.TELEFONE.PROCON,

                // parte credito
                score_digital: data.CONSULTA.CREDITO.SCORE_DIGITAL,
                propencao_pagamento: data.CONSULTA.CREDITO.PROPENSAO_PAGAMENTO,

                // parte empresa
                empresa_flfgts: data.CONSULTA.EMPRESAS.EMPRESA.FLFGTS,
                empresa_valor_presumido: data.CONSULTA.EMPRESAS.EMPRESA.VALOR_PRESUMIDO,
                empresa_probabilidade_saque: data.CONSULTA.EMPRESAS.EMPRESA.PROBABILIDADE_SAQUE,
                empresa_cnpj: data.CONSULTA.EMPRESAS.EMPRESA.CNPJ,
                empresa_razao: data.CONSULTA.EMPRESAS.EMPRESA.RAZAO
            });

            // console.table(clienteObj);
            const retorno = await ClientesRepository.create(clienteObj);
            // const retorno = "";

            return retorno;
        } catch(err) {
            throw err;
        }
    }
}

export default new ClientesService();