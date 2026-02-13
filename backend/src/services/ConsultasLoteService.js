import ConsultasLoteRepository from "../repositories/ConsultasLoteRepository.js";
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
}

export default new ConsultasLoteService();