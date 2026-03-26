import axios from 'axios';
import TokenAPIsRepository from "../../repositories/TokenAPIsRepository.js";
import IsTokenExpired from "../../utils/IsTokenExpired.js";
import TaskScheduler from "../../utils/TaskScheduler.js";

class V8CLTService {
    constructor() {
        this.accessToken = null;
    }

    async Autenticar() {
        try {
            const retorno = await TokenAPIsRepository.findOneByNameAndType("v8", "clt");

            if (retorno) {
                const status = IsTokenExpired(retorno.dataValues.updatedAt, retorno.dataValues.expires);

                if (!status.isExpired) {
                    this.accessToken = retorno.dataValues.access_token;

                    TaskScheduler.schedule("v8CLT", () => this.Autenticar(), status.delay);

                    return this.accessToken;
                }
            }

            console.log("Recuperando um novo token v8");

            const body = new URLSearchParams({
                grant_type: 'password',
                username: `${process.env.v8_username}`,
                password: `${process.env.v8_password}`,
                audience: `${process.env.v8_audience}`,
                scope: 'offline_access',
                client_id: `${process.env.v8_client_id}`
            });

            const response = await axios.post(`${process.env.v8_authURL}`, body);

            const TokenData = {
                nome_api: "v8",
                tipo_api: "clt",
                access_token: response.data.access_token,
                expires: response.data.expires_in
            }

            if (retorno) {
                await TokenAPIsRepository.update(retorno.dataValues.id, TokenData);
            } else {
                await TokenAPIsRepository.create(TokenData);
            }

            this.accessToken = response.data.access_token;

            const delay = IsTokenExpired((new Date).getTime(), TokenData.expires);
            TaskScheduler.schedule("v8CLT", () => this.Autenticar(), delay.delay);

            return this.accessToken;
        } catch (err) {
            console.error(`Não foi possível recuperar o token de acesso do V8-CLT: ${err}`);
        }
    }
}

export default new V8CLTService();