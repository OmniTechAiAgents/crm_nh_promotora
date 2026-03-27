import axios from 'axios';
import TokenAPIsRepository from "../../repositories/TokenAPIsRepository.js";
import IsTokenExpired from "../../utils/IsTokenExpired.js";
import TaskScheduler from "../../utils/TaskScheduler.js";
import ClientesService from '../ClientesService.js';
import NovaVidaService from './NovaVidaService.js';
import HttpException from '../../utils/HttpException.js';

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

    async GerarTermoSimularOperacao(cpf) {
        try {
            const idTermo = await this.#verificarERecuperarIdTermoConsentimento(cpf);

            await this.#aprovaAutorizacaoTermo(idTermo);

            // roda um while para ficar verificando o estado até dar "REJECTED" ou "SUCCESS"
            let flag = true;
            let objTermo;

            while (flag) {
                objTermo = await this.#verificarEstadoAutorizacaoTermo(cpf);

                if (objTermo.status == "SUCCESS") {
                    flag = false;
                } else if(objTermo.status == "REJECTED") {
                    throw new HttpException(`Não foi possível realizar a consulta: ${objTermo.description}`, 424);
                }
            }

            
            return objTermo;
        } catch (err) {
            // console.log(err)
            let status = !err.status ? 500 : err.status;
            let message = `Erro inesperado ao realizar a simulação: ${err}`;
            
            if (axios.isAxiosError(err)) {
                status = 424;
                
                if (err.response?.status === 429) {
                    // Mensagem personalizada para o limite de requisições
                    message = "O limite de requisições ao serviço de autorização foi excedido. Tente novamente em alguns instantes.";
                } else {
                    // Caso contrário, tenta pegar o 'result' ou o 'title' da API, senão mantém a default
                    message = err.response?.data?.result ?? err.response?.data?.title ?? message;
                }
            } else if (err instanceof Error) {
                message = err.message;
            }

            throw new HttpException(message, status);
        }
    }

    // funções internas (tem end-points demais para fazer tudo em uma função)
    async #verificarERecuperarIdTermoConsentimento(cpf) {
        try {
            // procura pelo cpf do cliente no end-point 1.1 e retorna o resultado se existir
            const endDateAtual = new Date().toISOString().split('.')[0] + 'Z';

            const response = await axios.get(`${process.env.v8_baseURL}/private-consignment/consult`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                },
                params: {
                    startDate: '2026-03-25T00:00:00Z',
                    endDate: endDateAtual,
                    limit: 5,
                    page: 1,
                    provider: "QI",
                    search: cpf
                }
            })
            if (response.data?.data[0]?.id) return response.data?.data[0]?.id;
            
            // se não existir, recupera pelo end-point 1
            const resultBuscaCliente = await ClientesService.procurarCpf(cpf); 
            if (!resultBuscaCliente || resultBuscaCliente?.length === 0) {
                const dadosCliente = await NovaVidaService.BuscarDados(cpf);
            
                if(dadosCliente.CONSULTA == "Não Autorizado") {
                    throw new HttpException("Não foi possível recuperar os dados do cliente na API do Nova Vida, será necessário fazer o cadastro do cliente manualmente.", 424);
                }

                await ClientesService.criarClienteNovaVida(dadosCliente, cpf);
            }
            const cliente = await ClientesService.procurarCpf(cpf);
            const cliente_ddd = cliente.dataValues.celular.slice(0, 2);
            const cliente_celular = cliente.dataValues.celular.slice(2);

            // montando body para o end-point 1
            const body = ({
                borrowerDocumentNumber: cpf,
                gender: "male",
                birthDate: cliente.dataValues.data_nasc,
                signerName: cliente.dataValues.nome,
                signerEmail: "email@gmail.com",
                signerPhone: {
                    countryCode: "55",
                    areaCode: cliente_ddd,
                    phoneNumber: cliente_celular
                }
            })

            const responseTermo = await axios.post(`${process.env.v8_baseURL}/private-consignment/consult`, 
                body,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    },
                }
            );
            return responseTermo?.data?.id;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async #aprovaAutorizacaoTermo(idTermo) {
        try {
            await axios.post(`${process.env.v8_baseURL}/private-consignment/consult/${idTermo}/authorize`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                }
            })
        } catch (err) {
            // console.log(err)
            const errorResponse = err.response;

            // verifica se o termo já não está aprovado
            const isAlreadyApproved = 
                errorResponse?.status === 400 && 
                errorResponse.data?.type === 'consult_already_approved';

            if (isAlreadyApproved) {
                return
            };
            
            const message = errorResponse?.data?.title || "Erro ao aprovar termo";
            const status = errorResponse?.status || 500;

            throw new HttpException(message, status);
        }
    }

    async #verificarEstadoAutorizacaoTermo(cpf) {
        try {
            const endDateAtual = new Date().toISOString().split('.')[0] + 'Z';

            const response = await axios.get(`${process.env.v8_baseURL}/private-consignment/consult`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                },
                params: {
                    startDate: '2026-03-25T00:00:00Z',
                    endDate: endDateAtual,
                    limit: 5,
                    page: 1,
                    provider: "QI",
                    search: cpf
                }
            })

            if (response.data?.data[0]?.id) {
                return response.data?.data[0]
            } else {
                throw new HttpException("O registro do usuário do usuário não foi encontrado no end-point de verificação de termo.", 424);
            };
        } catch (err) {
            throw err;
        }
    }
}

export default new V8CLTService();