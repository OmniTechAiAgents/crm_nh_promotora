import ConsultasLoteRepository from "../repositories/ConsultasLoteRepository.js";
import HttpException from "../utils/HttpException.js";
import { PublisherRabbitMQ } from "../utils/PublisherRabbitMQ.js";


class ConsultasLoteService {
    async Postar(data) {
        try {
            // manda para o DB
            const result = await ConsultasLoteRepository.create(data);

            // captura os dados necessários e monta a msg para o rabbitMQ
            await PublisherRabbitMQ("consultas_lote", result.dataValues);
        } catch(err) {
            throw err;
        }
    }

    async Editar(consultaId, status) {
        try {
            const existe = await ConsultasLoteRepository.findOneConsultaById(consultaId);
            if(!existe) throw new HttpException("Consulta não encontrada", 404);

            const bodyDB = ({
                ...existe,
                status: status
            })

            return await ConsultasLoteRepository.update(consultaId, bodyDB);
        } catch (err) {
            throw err;
        }
    }
}

export default new ConsultasLoteService();