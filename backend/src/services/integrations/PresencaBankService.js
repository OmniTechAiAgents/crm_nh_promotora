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
            let status = !err.status ? 500 : err.status;
            let message = "Erro inesperado ao realizar a simulação";
            
            if (axios.isAxiosError(err)) {
                status = 424;
                message = err.response?.data?.result ?? message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            throw new HttpException(message, status);
        }
    }

    async ConsultarVinculoMargemTabela(cpf) {
        try {
            // consultando vinculos
            const requestDataVinculos = ({cpf})
            const responseVinculos = await axios.post(`${process.env.presencaBank_baseURL}/v3/operacoes/consignado-privado/consultar-vinculos`,
                requestDataVinculos,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            );
            const listaResponseVinculos = responseVinculos.data.id;

            if (!listaResponseVinculos || listaResponseVinculos.length == 0) {
                throw new HttpException("O end-point de consulta de vinculos não retornou as informações necessárias", 424);
            }

            const resultadoFinal = [];

            for(const item of listaResponseVinculos) {
                await new Promise(resolve => setTimeout(resolve, 5000));

                console.log(`Fazendo operação com a matrícula: ${item.matricula}`);

                // consultando margem
                const requestDataMargem = ({
                    cpf: item.cpf,
                    matricula: item.matricula,
                    cnpj: item.numeroInscricaoEmpregador
                })
                const responseMargem = await axios.post(`${process.env.presencaBank_baseURL}/v3/operacoes/consignado-privado/consultar-margem`,
                    requestDataMargem,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        }
                    }
                )

                const margem = responseMargem.data;

                if (!margem) {
                    throw new HttpException(
                        "O end-point de consulta de margem não retornou as informações necessárias",
                        424
                    );
                }
                
                await new Promise(resolve => setTimeout(resolve, 5000));

                // consultando tabelas elegíveis
                const requestDataTabelas = ({
                    tomador: {
                        telefone: {
                            ddd: "011",
                            numero: "999999999"
                        },
                        cpf: item.cpf,
                        nome: "JOÃO PEDRO DA SILVA",
                        dataNascimento: responseMargem.data.dataNascimento,
                        nomeMae: responseMargem.data.nomeMae,
                        email: "example@gmail.com",
                        sexo: responseMargem.data.sexo,
                        vinculoEmpregaticio: {
                            cnpjEmpregador: responseMargem.data.cnpjEmpregador,
                            registroEmpregaticio: responseMargem.data.registroEmpregaticio,
                        },
                        dadosBancarios: {
                            codigoBanco: "001",
                            agencia: "1852",
                            conta: "27197",
                            digitoConta: "4",
                            formaCredito: "1"
                        },
                        endereco: {
                            cep: "",
                            rua: "",
                            numero: "",
                            complemento: "",
                            cidade: "",
                            estado: "",
                            bairro: ""
                        }
                    },
                    proposta: {
                        valorSolicitado: 0,
                        quantidadeParcelas: 0,
                        produtoId: 28,
                        valorParcela: responseMargem.data.valorMargemDisponivel
                    },
                    documentos: []
                })

                const responseTabelasElegiveis = await axios.post(`${process.env.presencaBank_baseURL}/v5/operacoes/simulacao/disponiveis`,
                    requestDataTabelas,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        }
                    }
                )

                const tabelas = responseTabelasElegiveis.data;

                if (!tabelas || tabelas.length === 0) {
                    throw new HttpException(
                        "O end-point de consulta de tabelas elegíveis não retornou as informações necessárias",
                        424
                    );
                }

                // FORMATANDO TABELAS

                const tabelasFormatadas = tabelas.map(tabela => ({
                    id_tabela: tabela.id,
                    nome: tabela.nome,
                    prazo: tabela.prazo,
                    taxaJuros: tabela.taxaJuros,
                    valorLiberado: tabela.valorLiberado,
                    tipoCredito: {
                        nome: tabela.tipoCredito?.name,
                        id: tabela.tipoCredito?.id
                    },
                    type: tabela.type,
                    valorParcela: tabela.valorParcela
                }));

                // OBJETO FINAL

                resultadoFinal.push({
                    cpf: item.cpf,
                    cnpjEmpregador: margem.cnpjEmpregador,
                    matricula: item.matricula,
                    dataAdmissao: margem.dataAdmissao,
                    valorMargemAvaliavel: margem.valorMargemDisponivel,
                    valorBaseMargem: margem.valorMargemBase,
                    valorTotalVencimentos: margem.valorTotalDevido,
                    nomeMae: margem.nomeMae,
                    sexo: margem.sexo,
                    tabelasElegiveis: tabelasFormatadas
                });
            }

            return resultadoFinal;

        } catch (err) {
            let status = !err.status ? 500 : err.status;
            let message = "Erro inesperado ao realizar a simulação";
            
            if (axios.isAxiosError(err)) {
                status = 424;
                message = err.response?.data?.result ?? message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            throw new HttpException(message, status);
        }
    }
}

export default new PresencaBankService();