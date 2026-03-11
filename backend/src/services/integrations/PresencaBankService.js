import axios from 'axios';
import TokenAPIsRepository from '../../repositories/TokenAPIsRepository.js';
import IsTokenExpired from '../../utils/IsTokenExpired.js';
import TaskScheduler from '../../utils/TaskScheduler.js';
import ClientesService from '../ClientesService.js';
import NovaVidaService from './NovaVidaService.js';
import HttpException from '../../utils/HttpException.js';

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

    async GerarTermoAutorizacao(cpf) {
        try {
            // buscando pelos dados do cliente
            const resultBuscaCliente = await ClientesService.procurarCpf(cpf); 
            if (!resultBuscaCliente || resultBuscaCliente?.length === 0) {
                const dadosCliente = await NovaVidaService.BuscarDados(cpf);
                
                if(dadosCliente.CONSULTA == "Não Autorizado") {
                    throw new HttpException("Não foi possível recuperar os dados do cliente na API do Nova Vida, será necessário fazer o cadastro do cliente manualmente.", 424);
                }

                await ClientesService.criarClienteNovaVida(dadosCliente, cpf);
            }
                
            const cliente = await ClientesService.procurarCpf(cpf);

            // montando o body para request
            const requestData = ({
                cpf: cpf,
                nome: cliente.dataValues.nome,
                telefone: cliente.dataValues.celular,
                produtoId: 28
            })

            // enviando a request
            const response = await axios.post(`${process.env.presencaBank_baseURL}/consultas/termo-inss`, 
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            );

            return response.data;
        } catch (err) {
            console.log(err.response.data)

            let status = 500;
            let message = "Erro inesperado ao realizar a simulação";
            
            if (axios.isAxiosError(err)) {
                status = 424;
                message = err.response?.data?.message ?? message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            throw new HttpException(message, status);
        }
    }
}

export default new PresencaBankService();