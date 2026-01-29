import axios from 'axios';
import TokenAPIsRepository from '../../repositories/TokenAPIsRepository.js';
import IsTokenExpired from '../../utils/IsTokenExpired.js';
import TaskScheduler from '../../utils/TaskScheduler.js';


class NossaFintechService {
    constructor () {
        this.accessToken = null;
    }

    async Autenticar() {
        try {
            const retorno = await TokenAPIsRepository.findOneByNameAndType("nossafintech", "fgts");

            if (retorno) {
                const status = IsTokenExpired(retorno.dataValues.updatedAt, retorno.dataValues.expires);

                // 1 - Verifica se o token está expirado
                if (!status.isExpired) {
                    this.accessToken = retorno.dataValues.access_token;

                    // 2 - Agenda a tarefa para refazer a autenticacao com base no tempo restante;
                    TaskScheduler.schedule("nossafintech", () => this.Autenticar(), status.delay);

                    // 3 - Retorna o token que ainda é valido
                    return this.accessToken;
                }
            }

            console.log("Recuperando um novo token nossa fintech.");

            const response = await axios.post(`${process.env.NossaFintech_baseURL}/auth/login`, {
                cpf: process.env.NossaFintech_cpf,
                promot_id: 1,
                password: process.env.NossaFintech_password
            });

            const TokenData = {
                nome_api: "nossafintech",
                tipo_api: "fgts",
                access_token: response.data.access_token,

                // 24 horas
                expires: response.data.expires_in
            };

            if (retorno) {
                await TokenAPIsRepository.update(retorno.dataValues.id, TokenData);
            } else {
                await TokenAPIsRepository.create(TokenData);
            }

            this.accessToken = response.data.access_token;

            const delay = IsTokenExpired((new Date).getTime(), TokenData.expires);
            TaskScheduler.schedule("nossafintech", () => this.Autenticar(), delay.delay);

            return this.accessToken;
        } catch(err) {
            console.error(`Não foi possivel recuperar o token de acesso da nossa fintech: ${err}`);
        }
    }

    getToken() {
        return this.accessToken;
    }
}

export default new NossaFintechService();