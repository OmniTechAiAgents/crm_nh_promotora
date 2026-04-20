import AuthRepository from "../repositories/AuthRepository.js";
import ConsultasCLTPythonRepository from "../repositories/ConsultasCLTPythonRepository.js";
import HttpException from "../utils/HttpException.js";
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

            const result  = await ConsultasCLTPythonRepository.searchPagination(pesquisa, limit, offset, atribuido, filtroUserId)

            return result;
        } catch(err) {
            throw err;
        }
    }

    async atribuirConsultasAUsuario(data) {
        try {
            const consultasFormatadas = await Promise.all(data.map(async (item) => {
                // verifica se o usuário existe no db
                const usuarioExiste = await AuthRepository.findOneById(item.usuario_id);
                if(!usuarioExiste) {
                    throw new HttpException(`Usuário com o Id "${item.usuario_id}" não existe no banco de dados.`, 404);
                }

                // verifica se a consulta CLT existe no db
                const consultaCLT = await ConsultasCLTPythonRepository.findOneById(item.id);
                if(!consultaCLT) {
                    throw new HttpException(`Consulta com o Id "${item.id}" não existe no banco de dados.`, 404);
                }

                // monta o body de edit
                const editBody = ({
                    ...consultaCLT.dataValues,

                    usuario_id: item.usuario_id
                })

                return editBody;
            }))

            console.log(consultasFormatadas);

            // usa a msm função de criar pq ela tbm serve para editar os campos
            return await ConsultasCLTPythonRepository.createMany(consultasFormatadas);
        } catch(err) {
            // console.log(err);
            throw err;
        }
    }
}

export default new ConsultasCLTPythonService();