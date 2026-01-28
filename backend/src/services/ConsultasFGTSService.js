import ConsultasFGTSRepository from "../repositories/ConsultasFGTSRepository.js";
import VCTexServices from "./integrations/VCTexServices.js";

class ConsultasFGTSService {
    async FazerConsulta (data, userData) {
        try {
            const instituicao = data.instituicao;
            let resultadoRaw = {}
        
            switch (instituicao) {
                case "VCTex":
                    resultadoRaw = await VCTexServices.Simulacao(data.cpf, userData.username);
                    break;
                default:
                    console.error("Instituição não encontrada");
                    break;
            }

            // mapeando o resultado
            const resultadoTratado = ({
                id: resultadoRaw.id,
                cpf: resultadoRaw.cpf,
                anuidades: resultadoRaw.anuidades,
                valor_bruto: resultadoRaw.valor_bruto,
                valor_liquido: resultadoRaw.valor_liquido,
                valor_tac: resultadoRaw.valor_tac,
                valor_seguro: resultadoRaw.valor_seguro,
                tabela: resultadoRaw.tabela,
                usuario: resultadoRaw.usuario,
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

    async RecuperarConsultas(pesquisa, page, limit) {
        try {
            const offset = (page - 1) * limit;

            const result = await ConsultasFGTSRepository.SearchPagination(pesquisa, limit, offset);

            return result;
        } catch {
            throw err;
        }
    }
}

export default new ConsultasFGTSService();