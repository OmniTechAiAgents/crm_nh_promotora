import ConsultasCLTPythonRepository from "../repositories/ConsultasCLTPythonRepository.js";
import ClientesService from "./ClientesService.js";

class ConsultasCLTPythonService {
    async armazenarConsultas(data, instituicao) {
        try {
            const consultasFormatadas = await Promise.all(data.map(async (item) => {
                let clienteData;

                // tenta buscar a primeira vez
                clienteData = await ClientesService.procurarCpf(item.cpf);
                if (!clienteData || clienteData.length === 0) {
                    await ClientesService.criarClienteDB({
                        cpf: item.cpf,
                        nome: item.nome,
                        data_nasc: item.data_nasc,
                        celular: item.celular
                    })
                }

                // tenta buscar dps de criar (garantir integridade)
                clienteData = await ClientesService.procurarCpf(item.cpf);

                return {
                    cliente_id: clienteData.dataValues.id,
                    valor_parcela: item.valor_parcela,
                    valor_solicitado: item.valor_solicitado,
                    qtd_parcelas: item.qtd_parcelas,
                    cnpj: item.cnpj,
                    empresa: item.empresa,
                    instituicao: instituicao
                }
            }))

            return await ConsultasCLTPythonRepository.createMany(consultasFormatadas);
        } catch (err) {
            throw err;
        }
    }
}

export default new ConsultasCLTPythonService();