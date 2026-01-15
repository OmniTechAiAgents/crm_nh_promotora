import axios from 'axios';
import TokenAPIsRepository from '../../repositories/TokenAPIsRepository.js';
import IsTokenExpired from '../../utils/IsTokenExpired.js';
import TaskScheduler from '../../utils/TaskScheduler.js';

class NovaVidaService {
    constructor () {
        this.accessToken = null;
    }

    async Autenticar() {
        try {
            const retorno = await TokenAPIsRepository.findOneByNameAndType("novavida", "fgts");

            if (retorno) {
                const status = IsTokenExpired(retorno.dataValues.updatedAt, retorno.dataValues.expires);

                // 1 - Verifica se o token está expirado
                if (!status.isExpired) {
                    this.accessToken = retorno.dataValues.access_token;

                    // 2 - Agenda a tarefa para refazer a autenticacao com base no tempo restante;
                    TaskScheduler.schedule("novavida", () => this.Autenticar(), status.delay);

                    // 3 - Retorna o token que ainda é valido
                    return this.accessToken;
                }
            }

            console.log("Recuperando um novo token nova vida.");

            const response = await axios.post(`${process.env.NV_baseURL}/GerarTokenJson`, {
                credencial: {
                    usuario: process.env.NV_usuario,
                    senha: process.env.NV_senha,
                    cliente: process.env.NV_cliente
                }
            });

            const TokenData = {
                nome_api: "novavida",
                tipo_api: "fgts",
                access_token: response.data.d,

                // 24 horas
                expires: 86400
            };

            if (retorno) {
                await TokenAPIsRepository.update(retorno.dataValues.id, TokenData);
            } else {
                await TokenAPIsRepository.create(TokenData);
            }

            this.accessToken = response.data.d;

            const delay = IsTokenExpired((new Date).getTime(), TokenData.expires);
            TaskScheduler.schedule("novavida", () => this.Autenticar(), delay.delay);

            return this.accessToken;
        } catch(err) {
            console.error(`Não foi possivel recuperar o token de acesso da NovaVida: ${err}`);
        }
    }

    async BuscarDados(cpf) {
        try {
            const response = await axios.post(`${process.env.NV_baseURL}/NVBOOK_CEL_OBG`, {
                documento: cpf,
                token: this.accessToken
            });

            return response.data.d;
        } catch (err) {
            if(axios.isAxiosError(err)) {
                const status = err.response?.data?.statusCode || 500;
                const message = err.response?.data?.message || "Erro desconhecido.";

                throw new HttpException(message, status);
            }

            throw new HttpException(err.message, 500);
        }
    }

    getToken() {
        return this.accessToken;
    }
}

export default new NovaVidaService();