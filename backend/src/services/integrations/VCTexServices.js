import axios from 'axios';
import TokenAPIsRepository from '../../repositories/TokenAPIsRepository.js';
import IsTokenExpired from '../../utils/IsTokenExpired.js';
import TaskScheduler from '../../utils/TaskScheduler.js';

class VCTexServices {
    constructor() {
        this.accessTokenVCTex = null;
    }

    async Autenticar() {
        try {
            const retorno = await TokenAPIsRepository.findOneByNameAndType("vctex", "fgts");

            if (retorno) {
                const status = IsTokenExpired(retorno.dataValues.createdAt, retorno.dataValues.expires);

                // 1 - Verifica se o token está expirado
                if (!status.isExpired) {
                    // 2 - Agenda a tarefa para refazer a autenticacao com base no tempo restante;
                    TaskScheduler.schedule("VCTexFGTS", () => this.Autenticar(), status.delay);

                    // 3 - Retorna o token que ainda é valido
                    return retorno.dataValues.access_token;
                }
            }

            console.log(`Rodando a logica de gerar um novo token.`);

            const response = await axios.post(`${process.env.VCTex_baseURL}/authentication/login`, {
                cpf: process.env.VCTEX_user,
                password: process.env.VCTEX_password
            });

            const TokenData = {
                nome_api: "vctex",
                tipo_api: "fgtS",
                access_token: response.data.token.accessToken,
                expires: response.data.token.expires
            }

            if (retorno) {
                await TokenAPIsRepository.update(retorno.dataValues.id, TokenData);
            } else {
                await TokenAPIsRepository.create(TokenData);
            }
            
            // reagendar a tarefa com o schreduler
            const delay = IsTokenExpired((new Date).getTime(), TokenData.expires);
            TaskScheduler.schedule("VCTexFGTS", () => this.Autenticar(), delay.delay);

            return response.data.token.accessToken;
        } catch(err) {
            console.error(`Não foi possivel recuperar o token de acesso da VCTex: ${err}`);
        }
    }

    getToken() {
        return this.accessTokenVCTex;
    }
}

export default new VCTexServices();