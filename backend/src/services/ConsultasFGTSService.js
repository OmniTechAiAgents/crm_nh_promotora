import ConsultasFGTSRepository from "../repositories/ConsultasFGTSRepository.js";
import VCTexServices from "./integrations/VCTexServices.js";
import NossaFintechService from "./integrations/NossaFintechService.js";
import AuthService from "./AuthService.js";

class ConsultasFGTSService {
    async FazerConsulta (data, userData) {
        try {
            const instituicao = data.instituicao;
            let resultadoRaw = {}
        
            switch (instituicao) {
                case "VCTex":
                    resultadoRaw = await VCTexServices.Simulacao(data.cpf, userData.id);
                    break;
                case "Nossa fintech":
                    resultadoRaw = await NossaFintechService.Simulacao(data.cpf, userData.id);
                    break;
                default:
                    console.error("Instituição não encontrada");
                    break;
            }

            // padronizando a array de anuidades
            const anuidadesPadronizadas = (resultadoRaw.anuidades || []).map(a => ({
                dueDate: a.dueDate ?? a.due_date,
                amount: a.amount ?? a.total_amount
            }));

            // recuperando e tratando dados do usuário
            const usuarioRaw = await AuthService.BuscarUsuarioPorId(resultadoRaw.usuario_id);
            const usuario_data = {
                id: usuarioRaw.dataValues.id,
                username: usuarioRaw.dataValues.username,
                role: usuarioRaw.dataValues.role
            }

            // mapeando o resultadoo
            const resultadoTratado = ({
                id: resultadoRaw.id,
                cpf: resultadoRaw.cpf,
                anuidades: anuidadesPadronizadas,
                valor_bruto: resultadoRaw.valor_bruto,
                valor_liquido: resultadoRaw.valor_liquido,
                valor_tac: resultadoRaw.valor_tac,
                valor_seguro: resultadoRaw.valor_seguro,
                tabela: resultadoRaw.tabela,
                usuario: usuario_data,
                chave: resultadoRaw.chave,
                banco: resultadoRaw.banco,
                mensagem: resultadoRaw.mensagem,
                elegivelProposta: resultadoRaw.elegivelProposta,
                updatedAt: resultadoRaw.updatedAt,
                createdAt: resultadoRaw.createdAt
            })

            return resultadoTratado;

        } catch (err) {
            throw err;
        }
    }

    async RecuperarConsultas(pesquisa, page, limit, userData) {
        try {
            const offset = (page - 1) * limit;

            // se for promotor, filtra para apenas as propostas dele, se for adm, pega todas as propostas
            const filtroUserId = userData.role == "promotor" ? userData.id : null;

            const result = await ConsultasFGTSRepository.SearchPagination(pesquisa, limit, offset, filtroUserId);

            return result;
        } catch {
            throw err;
        }
    }
}

export default new ConsultasFGTSService();