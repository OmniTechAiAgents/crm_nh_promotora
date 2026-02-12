import ConsultasLoteRepository from "../repositories/ConsultasLoteRepository.js";


class ConsultasLoteService {
    async Postar(data) {
        try {
            // manda para o DB
            const result = await ConsultasLoteRepository.create(data);

            // captura os dados necessários e monta a msg para o rabbitMQ
            console.log("Body que seria enviado para o rabbitMQ:")
            console.log(result.dataValues);
        } catch(err) {
            throw err;
        }
    }
}

export default new ConsultasLoteService();