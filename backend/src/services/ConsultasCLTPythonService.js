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

                // verifica se já tem uma consulta CLT Python na tabela
                const consultaExistente = await ConsultasCLTPythonRepository.searchDuplicates(clienteData.dataValues.id, instituicao, item.cnpj);

                const dadosConsulta = {
                    cliente_id: clienteData.dataValues.id,
                    valor_parcela: item.valor_parcela,
                    valor_solicitado: item.valor_solicitado,
                    qtd_parcelas: item.qtd_parcelas,
                    cnpj: item.cnpj,
                    empresa: item.empresa,
                    instituicao: instituicao
                }

                // se a consulta existe, passa o id dela no objeto para que ele altere no banco ao invés de criar uma nova
                if (consultaExistente) {
                    dadosConsulta.id = consultaExistente.id;
                    dadosConsulta.ofertado = false
                }

                return dadosConsulta;
            }))

            return await ConsultasCLTPythonRepository.createMany(consultasFormatadas);
        } catch (err) {
            throw err;
        }
    }

    async recuperarConsultas(page, limit, pesquisa, atribuido, userData) {
        try {
            const offset = (page - 1) * limit;

            // coloca validação para aplicar o filtro de "atribuido" apenas para admins
            if (userData.role != "admin") atribuido = null;

            // transformar booleano para integer por quase do sequelize
            atribuido == "true" ? atribuido = 1 : atribuido = 0;

            // colocando filtro para o promotor só pegar as ofertas que foram atribuidas para ele
            const filtroUserId = userData.role == "promotor" ? userData.id : null;

            console.log(`
                Page: ${page},
                Limit: ${limit},
                Pesquisa: ${pesquisa},
                Atribuido: ${atribuido},
                UserData: ${userData}
                `)

            const result  = await ConsultasCLTPythonRepository.searchPagination(pesquisa, limit, offset, atribuido, filtroUserId)

            return result;
        } catch(err) {
            throw err;
        }
    }
}

export default new ConsultasCLTPythonService();