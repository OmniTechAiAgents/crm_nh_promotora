import axios from 'axios';
import TokenAPIsRepository from "../../repositories/TokenAPIsRepository.js";
import IsTokenExpired from "../../utils/IsTokenExpired.js";
import TaskScheduler from "../../utils/TaskScheduler.js";
import ClientesService from '../ClientesService.js';
import NovaVidaService from './NovaVidaService.js';
import HttpException from '../../utils/HttpException.js';
import PropostasCLTRepository from '../../repositories/PropostasCLTRepository.js';

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

            await new Promise(resolve => setTimeout(resolve, 3000));

            await this.#aprovaAutorizacaoTermo(idTermo);

            // roda um while para ficar verificando o estado até dar "REJECTED" ou "SUCCESS"
            let flag = true;
            let objTermo;

            while (flag) {
                objTermo = await this.#verificarEstadoAutorizacaoTermo(cpf);
                console.log(objTermo)

                if (objTermo.status == "REJECTED") {
                    throw new HttpException(`Não foi possível realizar a consulta: ${objTermo.description}`, 424);
                } else if (
                    (objTermo.status == "WAITING_CONSULT" || objTermo.status == "CONSENT_APPROVED") 
                    && !objTermo.availableMarginValue
                ) {
                    throw new HttpException("Requisição aceita, porém API parceira está aguardando a consulta.", 422);
                } else if (objTermo.status == "SUCCESS" || objTermo.status == "CONSENT_APPROVED") {
                    flag = false;
                }

                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            const tabelasDisponiveis = await this.#recuperarTabelasDisponiveis();

            const bodyRetorno = ({
                cpf,
                idTermo: idTermo,
                cnpjEmpregador: null,
                matricula: null,
                dataAdmissao: null,
                valorMargemAvaliavel: parseFloat(objTermo.availableMarginValue),
                valorBaseMargem: null,
                valorTotalVencimentos: null,
                nomeMae: "MARIA DA SILVA",
                sexo: "M",
                tabelasElegiveis : tabelasDisponiveis
            })

            // colocando dentro de uma array para ficar no padrão do presença
            return [bodyRetorno];
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

    async SimularProposta(dados) {
        try {
            const simulacao = await this.#simularUmaProposta(
                dados.idTermo,
                dados.tabelaId,
                dados.valorParcelas,
                dados.qtdParcelas
            )

            const bodyRetorno = ({
                id_simulacao: simulacao.id_simulation,
                valor_total: simulacao.disbursement_amount,
                id_tabela: simulacao.simulation_config_id,
                nome_tabela: simulacao.simulation_config_slug,
                qtd_parcelas: simulacao.number_of_installments,
                valor_parcelas: simulacao.installment_value,
                taxa_juros_mensal: simulacao.monthly_interest_rate,
                valor_solicitado: simulacao.operation_amount,
                valor_liberado: simulacao.disbursed_issue_amount,
            })

            return bodyRetorno;
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

    async DigitarProposta(dados, userId) {
        try {
            // recuperando dados do cliente
            const resultBuscaCliente = await ClientesService.procurarCpf(dados.cpf); 
            if (!resultBuscaCliente || resultBuscaCliente?.length === 0) {
                const dadosCliente = await NovaVidaService.BuscarDados(dados.cpf);
            
                if(dadosCliente.CONSULTA == "Não Autorizado") {
                    throw new HttpException("Não foi possível recuperar os dados do cliente na API do Nova Vida, será necessário fazer o cadastro do cliente manualmente.", 424);
                }

                await ClientesService.criarClienteNovaVida(dadosCliente, dados.cpf);
            }
            const cliente = await ClientesService.procurarCpf(dados.cpf);
            const cliente_ddd = cliente.dataValues.celular.slice(0, 2);
            const cliente_celular = cliente.dataValues.celular.slice(2);
            let bancoEscolhido = null;

            if (dados.bankCode) {
                bancoEscolhido = await this.#buscarBancoPorCodigo(dados.bankCode);
            }
            

            const bodyProposta = ({
                borrower: {
                    name: cliente.dataValues.nome,
                    email: "example@gmail.com",
                    phone: {
                        area_code: cliente_ddd,
                        country_code: "55",
                        number: cliente_celular
                    },
                    political_exposition: false,
                    address: {
                        city: "São Paulo",
                        state: "SP",
                        number: "346",
                        street: "Rua Líbero Badaró",
                        complement: "",
                        postal_code: "01002010",
                        neighborhood: "Centro"
                    },
                    birth_date: cliente.dataValues.data_nasc,
                    mother_name: "MARIA DA SILVA",
                    nationality: "brazilian",
                    document_issuer: "SSP",
                    gender: "male",
                    person_type: "natural",
                    marital_status: "single",
                    individual_document_number: dados.cpf,
                    document_identification_date: "2025-09-16",
                    document_identification_type: "rg",
                    document_identification_number: "string",
                    bank: dados.pixKey ? {
                        transfer_method: "pix",
                        pix_key: dados.pixKey,
                        pix_key_type: dados.pixKeyType,
                    } : {
                        transfer_method: "ted",
                        bank_id: bancoEscolhido?.id,
                        bank_code: dados.bankCode,
                        account_digit: dados.accountDigit,
                        branch_number: dados.branchNumber,
                        account_number: dados.accountNumber,
                    }
                },
                simulation_id: dados.simulacaoId
            })

            console.log(bodyProposta);

            const responseProposta = await this.#digitarUmaProposta(bodyProposta);

            // esse é o exato ponto onde eu vou ter q tentar capturar o erro do timeout
            // dps de capturar o erro eu vou ter q mandar uma request para a rota q retorna a lista de propostas tentando buscar por essa em quasão
            // ideia: tentar usar o cpf e a data como filtro

            await new Promise(resolve => setTimeout(resolve, 5000));
            const dadosProposta = await this.#buscarInformacoesProposta(responseProposta.id);

            const bodyDB = ({
                nome: cliente.dataValues.nome,
                cpf: dados.cpf,
                cel: cliente.dataValues.celular,
                data_nascimento: cliente.dataValues.data_nasc,
                nome_tabela: dados.nomeTabela,
                id_proposta: responseProposta.id,
                link_form: responseProposta.formalization_url,
                contrato: dadosProposta.contract_url,
                numero_contrato: dadosProposta.contract_number,
                usuario_id: userId,
                qtd_parcelas: dados.qtdParcelas,
                valor_parcelas: dados.valorParcelas,
                taxa_juros_mensal: dados.taxaJurosMensal,
                valor_solicitado: dados.valorSolicitado,
                valor_liberado: dados.valorLiberado,
                status_nome: dadosProposta.status,
                status_id : "",
                produto_nome: "",
                produto_id: null,
                status_historicos: null,
                verificar: 1,
                API: "v8"
            })

            return await PropostasCLTRepository.create(bodyDB);
        } catch(err) {
            console.log(err)
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

    async VerificarTodasAsPropostas() {
        try {
            const propostasParaVerificar = await PropostasCLTRepository.findAllParaVerificar("v8");

            for (const { id_proposta } of propostasParaVerificar) {
                await this.#verificarUmEAtualizarRegistroPropostaDB(id_proposta);

                await new Promise(resolve => setTimeout(resolve, 5000));
            };

            TaskScheduler.schedule("Verificar propostas do V8CLT", () => this.VerificarTodasAsPropostas(), 600000);
        } catch(err) {
            console.error(`Não foi possível verificar as propostas do V8 CLT: ${err}`);
        }
    }

    async CancelarProposta(proposalId, motivo) {
        try {
            // chama função interna que manda a request de cancelamento
            await this.#cancelarProposta(proposalId, motivo);

            // atualiza o dado no nosso banco de dados
            await this.#verificarUmEAtualizarRegistroPropostaDB(proposalId);
 
            // retornando o body do banco (para futura implementação de chatbot);
            return await PropostasCLTRepository.findOneByProposalId(proposalId);
        } catch(err) {
            console.log(err)
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
            
            // timeout top
            await new Promise(resolve => setTimeout(resolve, 5000));

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

    async #recuperarTabelasDisponiveis() {
        try {
            const response = await axios.get(`${process.env.v8_baseURL}/private-consignment/simulation/configs`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                },
            })

            return response?.data?.configs;
        } catch (err) {
            throw err;
        }
    }

    async #simularUmaProposta(idTermo, idTabela, valorParcela, qtdParcelas) {
        try {
            const body = ({
                consult_id: idTermo,
                config_id: idTabela,
                installment_face_value: valorParcela,
                number_of_installments: qtdParcelas,
                provider: "QI"
            })

            const response = await axios.post(`${process.env.v8_baseURL}/private-consignment/simulation`, 
                body,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            )

            return response.data;
        } catch (err) {
            throw err;
        }
    }

    async #digitarUmaProposta(bodyProposal) {
        try {
            const response = await axios.post(`${process.env.v8_baseURL}/private-consignment/operation`, 
                bodyProposal,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            )

            return response.data;
        } catch (err) {
            throw err;
        }
    }

    async #buscarInformacoesProposta(id_proposta) {
        try {
            const response = await axios.get(`${process.env.v8_baseURL}/private-consignment/operation/${id_proposta}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                },
            })

            // retorna todos os dados do body caso forem necessários
            return response?.data;
        } catch (err) {
            throw err;
        }
    }

    async #buscarBancoPorCodigo(codigoBanco) {
        try {
            const response = await axios.get(`${process.env.v8_baseURL}/banks`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                },
            });

            const bancos = response.data.data;

            const bancoEncontrado = bancos.find(banco => banco.code === String(codigoBanco));

            if (!bancoEncontrado) {
                throw new HttpException(`Banco com o código '${codigoBanco}' não foi encontrado no sistema v8.`, 424);
            }

            return bancoEncontrado;

        } catch (err) {
            throw err;
        }
    }

    async #verificarUmEAtualizarRegistroPropostaDB(proposalId) {
        try {
            const STATUS_FINALIZADOS = new Set([
                "paid",
                "canceled",
                "refunded"
            ]);

            // recupera todas as informações da proposta, incluindo o status dela
            const proposalData = await axios.get(`${process.env.v8_baseURL}/private-consignment/operation/${proposalId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    },
                }
            );

            const verificar = !STATUS_FINALIZADOS.has(proposalData.data.status);

            const propostaDB = await PropostasCLTRepository.findOneByProposalId(proposalId);

            // monta o body com as novas informações atualizadas, porém armazenando apenas o que interessa
            const dadosAtualizados = {
                ...propostaDB,

                // por algum motivo, o "contract_url" é o msm q link form nesse end-point
                link_form: proposalData?.data?.contract_url,
                status_nome: proposalData?.data?.status,
                verificar
            }

            return await PropostasCLTRepository.updateByProposalId(proposalId, dadosAtualizados);
        } catch(err) {
            throw err;
        }
    }

    async #cancelarProposta(proposalId, motivoCancelamento) {
        try {
            await axios.post(`${process.env.v8_baseURL}/private-consignment/operation/${proposalId}/cancel`,
                {
                    cancel_reason: "invalid_data:other",
                    cancel_description: motivoCancelamento,
                    provider: "QI"
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            )
        } catch(err) {
            throw err;
        }
    }

    getToken() {
        return this.accessToken;
    }
}

export default new V8CLTService();