import axios from 'axios';
import TokenAPIsRepository from '../../repositories/TokenAPIsRepository.js';
import IsTokenExpired from '../../utils/IsTokenExpired.js';
import TaskScheduler from '../../utils/TaskScheduler.js';

class PresencaBankService {
    constructor() {
        this.accessToken = null;
    }

    async Autenticar() {
        try {
            const retorno = await TokenAPIsRepository.findOneByNameAndType("presencaBank", "clt");

            if (retorno) {
                const status = IsTokenExpired(retorno.dataValues.updatedAt, retorno.dataValues.expires);

                if (!status.isExpired) {
                    this.accessToken = retorno.dataValues.access_token;

                    TaskScheduler.schedule("presencaCLT", () => this.Autenticar(), status.delay);

                    return this.accessToken;
                }
            }

            console.log("Recuperando um novo token presença bank");

            const response = await axios.post(`${process.env.presencaBank_baseURL}/login`, {
                login: process.env.presencaBank_login,
                senha: process.env.presencaBank_senha
            });

            const expiracaoSegundos = Math.floor((new Date(response.data.expireAt).getTime() - Date.now()) / 1000);

            const TokenData = {
                nome_api: "presencaBank",
                tipo_api: "clt",
                access_token: response.data.token,
                expires: expiracaoSegundos
            }

            if (retorno) {
                await TokenAPIsRepository.update(retorno.dataValues.id, TokenData);
            } else {
                await TokenAPIsRepository.create(TokenData);
            }

            this.accessToken = response.data.token;

            const delay = IsTokenExpired((new Date).getTime(), TokenData.expires);
            TaskScheduler.schedule("presencaCLT", () => this.Autenticar(), delay.delay);

            return this.accessToken;
        } catch (err) {
            console.error(`Não foi possivel recuperar o token de acesso do Presença bank: ${err}`);
        }
    }
}

export default new PresencaBankService();