import axios from 'axios';
import TokenAPIsRepository from '../../repositories/TokenAPIsRepository.js';
import IsTokenExpired from '../../utils/IsTokenExpired.js';
import TaskScheduler from '../../utils/TaskScheduler.js';
import HttpException from '../../utils/HttpException.js';
import { response } from 'express';

class VCTexServices {
    constructor() {
        this.accessToken = null;
    }

    async Autenticar() {
        try {
            const retorno = await TokenAPIsRepository.findOneByNameAndType("vctex", "fgts");

            if (retorno) {
                const status = IsTokenExpired(retorno.dataValues.updatedAt, retorno.dataValues.expires);

                // 1 - Verifica se o token está expirado
                if (!status.isExpired) {
                    this.accessToken = retorno.dataValues.access_token;

                    // 2 - Agenda a tarefa para refazer a autenticacao com base no tempo restante;
                    TaskScheduler.schedule("VCTexFGTS", () => this.Autenticar(), status.delay);

                    // 3 - Retorna o token que ainda é valido
                    return this.accessToken;
                }
            }

            console.log("Recuperando um novo token VCTex")

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
            
            // atualiza o accessToken q ta na memoria
            this.accessToken = response.data.token.accessToken;

            // reagendar a tarefa com o schreduler
            const delay = IsTokenExpired((new Date).getTime(), TokenData.expires);
            TaskScheduler.schedule("VCTexFGTS", () => this.Autenticar(), delay.delay);

            return this.accessToken;
        } catch(err) {
            console.error(`Não foi possivel recuperar o token de acesso da VCTex: ${err}`);
        }
    }

    async Simulacao(cpf, userUsername) {
        try {
            const rawResponse = await axios.post(`${process.env.VCTex_baseURL}/service/simulation`, {
                    clientCpf: cpf,
                    feeScheduleId: 0,
                    player: "QITECH"
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            
            const response = {
                cpf: cpf,
                anuidades: rawResponse.data.data.simulationData.installments,
                saldo: rawResponse.data.data.simulationData.totalReleasedAmount,
                valor_bruto: rawResponse.data.data.simulationData.totalAmount,
                valor_liquido: rawResponse.data.data.simulationData.totalReleasedAmount,
                valor_tac: rawResponse.data.data.simulationData.contractTacAmount,
                valor_seguro: rawResponse.data.data.simulationData.contractInsuranceAmount,
                tabela: "Tabela Exponencial",
                usuario: userUsername,
                chave: rawResponse.data.data.financialId,
                banco: "QITECH"
            }

            return console.log(response);
        } catch (err) {
            // se for erro do axios, usa a exception personalizada q criei
            if(axios.isAxiosError(err)) {
                const status = err.response?.data?.statusCode || 500;
                const message = err.response?.data?.message || "Erro inesperado ao realizar a simulação";

                console.log("erro VCtex disparado.")
                throw new HttpException(message, status);
            }

            throw new HttpException(err.message, 500);
        }
    }

    getToken() {
        return this.accessToken;
    }
}

export default new VCTexServices();