import axios from 'axios';
import TokenAPIsRepository from '../../repositories/TokenAPIsRepository.js';
import IsTokenExpired from '../../utils/IsTokenExpired.js';
import TaskScheduler from '../../utils/TaskScheduler.js';
import HttpException from '../../utils/HttpException.js';
import ConsultasFGTSRepository from '../../repositories/ConsultasFGTSRepository.js';


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

    async Simulacao(cpf, userUsername) {
        try {
            // manda request para rota de verificar saldo
            const responseSaldo = await axios.post(`${process.env.NossaFintech_baseURL}/nossa/v1/balance`,
                { cpf },
                {
                    timeout: 45_000,
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            )

            if (!responseSaldo) {
                throw new Error("Falha ao realizar consulta de saldo");
            }

            // DESCOMENTAR DEPOIS
            // if (responseSaldo.data.data.periods.length < 3) {
            //     throw new HttpException("O numero de parcelas é menor do que o mínimo (3).", 400)
            // }

            const bodySimulacao = ({
                cpf: cpf,
                key: responseSaldo.data.key,
                number_of_installments: responseSaldo.data.data.periods.length,
                eligibility: responseSaldo.data.eligible,
                cod_produto: 101
            });

            // manda request para simular
            const responseSimulacao = await axios.post(`${process.env.NossaFintech_baseURL}/nossa/v1/simulation`,
                bodySimulacao,
                {
                    timeout: 45_000,
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            )

            if (!responseSimulacao) {
                throw new Error("Falha ao realizar simulação");
            }

            let valorTac = null;
            let fees = responseSimulacao?.data.external_contract_fees ?? []

            if (fees.length && fees[0]?.fee_type === "tac") {
                fees.forEach(item => {
                    valorTac = valorTac + item.fee_amount;
                });
            }

            const bodyDB = {
                cpf: cpf,
                anuidades: responseSimulacao.data.installments.map(item => ({
                    due_date: item.due_date,
                    total_amount: item.total_amount,
                })),
                saldo: null,
                valor_bruto: responseSimulacao.data.issue_amount,
                valor_liquido: responseSimulacao.data.disbursed_issue_amount,
                valor_tac: valorTac,
                valor_seguro: null,
                tabela: "Tabela Nossa Melhor",
                usuario: userUsername,
                chave: responseSimulacao.data.key,
                banco: "Singulare",
                mensagem: "Consulta realizada com sucesso!",
                elegivelProposta: true
            }

            const retorno = await ConsultasFGTSRepository.Create(bodyDB);

            return retorno;
        } catch (err) {
            let status = 500;
            let message = "Erro inesperado ao realizar a simulação";
            
            if (axios.isAxiosError(err)) {
                status = err.response?.data?.statusCode ?? 500;
                message = err.response?.data?.data?.error_description ?? message;

                
            } else if (err instanceof Error) {
                message = err.message;
            }

            const response = {
                cpf,
                anuidades: null,
                saldo: null,
                valor_bruto: null,
                valor_liquido: null,
                valor_tac: null,
                valor_seguro: null,
                tabela: "Tabela Nossa Melhor",
                usuario: userUsername,
                chave: null,
                banco: null,
                mensagem: message,
                elegivelProposta: false
            };

            await ConsultasFGTSRepository.Create(response);

            throw new HttpException(message, status);
        }
    }

    getToken() {
        return this.accessToken;
    }
}

export default new NossaFintechService();