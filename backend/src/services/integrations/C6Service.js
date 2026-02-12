import axios from 'axios';
import TokenAPIsRepository from '../../repositories/TokenAPIsRepository.js';
import IsTokenExpired from '../../utils/IsTokenExpired.js';
import TaskScheduler from '../../utils/TaskScheduler.js';
import ClientesService from '../ClientesService.js';
import NovaVidaService from './NovaVidaService.js';

class C6Service {
    constructor() {
        this.accessToken = null;
    }

    async Autenticar() {
        try {
            const retorno = await TokenAPIsRepository.findOneByNameAndType("c6", "clt");

            if (retorno) {
                const status = IsTokenExpired(retorno.dataValues.updatedAt, retorno.dataValues.expires);

                // 1 - Verifica se o token está expirado
                if (!status.isExpired) {
                    this.accessToken = retorno.dataValues.access_token;

                    // 2 - Agenda a tarefa para refazer a autenticacao com base no tempo restante;
                    TaskScheduler.schedule("C6", () => this.Autenticar(), status.delay);

                    // 3 - Retorna o token que ainda é valido
                    return this.accessToken;
                }
            }

            console.log("Recuperando um novo token C6.")

            const reqData = new URLSearchParams();
            reqData.append("username", process.env.C6_username);
            reqData.append("password", process.env.C6_password);

            const response = await axios.post(`${process.env.C6_baseURL}/auth/token`, reqData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const TokenData = {
                nome_api: "c6",
                tipo_api: "clt",
                access_token: response.data.access_token,
                expires: response.data.expires_in_seconds
            }

            if (retorno) {
                await TokenAPIsRepository.update(retorno.dataValues.id, TokenData);
            } else {
                await TokenAPIsRepository.create(TokenData);
            }

            // atualiza o accessToken q ta na memoria
            this.accessToken = response.data.access_token;

            // reagendar a tarefa com o schreduler
            const delay = IsTokenExpired((new Date).getTime(), TokenData.expires);
            TaskScheduler.schedule("C6", () => this.Autenticar(), delay.delay);

            return this.accessToken;
        } catch(err) {
            console.error(`Não foi possivel recuperar o token de acesso da C6: ${err}`);
        }
    }

    async GerarLinkAutenticacaoCLT(cpf) {
        try {
            const resultBuscaCliente = await ClientesService.procurarCpf(data.cpf); 
            if (!resultBuscaCliente || resultBuscaCliente?.length === 0) {
                const dadosCliente = await NovaVidaService.BuscarDados(data.cpf);
            
                await ClientesService.criarClienteNovaVida(dadosCliente, data.cpf);
            }
            
            const clienteData = await ClientesService.procurarCpf(data.cpf);

            const clienteBody = ({
                nome: clienteData.dataValues.nome,
                cpf: clienteData.dataValues.cpf,
                data_nascimento: clienteData.dataValues.data_nasc,

                telefone: {
                    numero: clienteData.dataValues.celular_numero,
                    codigo_area: clienteData.dataValues.celular_ddd
                }
            })

            const response = await axios.post(`${process.env.C6_baseURL}/marketplace/authorization/generate-liveness`, 
                clienteBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/vnd.c6bank_authorization_generate_liveness_v1+json",
                        "Authorization": this.accessToken
                    },
                }
            );

            // também gera o timestamp de expiração se precisar armazenar
            return response.data.link;
        } catch (err) {
            throw err;
        }
    }

    getToken() {
        return this.accessToken;
    }
}

export default new C6Service();