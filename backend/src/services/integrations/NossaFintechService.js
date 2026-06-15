import axios from 'axios';
import TokenAPIsRepository from '../../repositories/TokenAPIsRepository.js';
import IsTokenExpired from '../../utils/IsTokenExpired.js';
import TaskScheduler from '../../utils/TaskScheduler.js';
import HttpException from '../../utils/HttpException.js';
import ConsultasFGTSRepository from '../../repositories/ConsultasFGTSRepository.js';
import ClientesService from '../ClientesService.js';
import ISPBRepository from '../../repositories/ISPBRepository.js';
import PropostasRepository from '../../repositories/PropostasRepository.js';
import NovaVidaService from './NovaVidaService.js';
import PropostasCLTRepository from '../../repositories/PropostasCLTRepository.js';


class NossaFintechService {
    constructor() {
        this.accessToken = null;
    }

    // ============================================
    //                     FGTS
    // ============================================
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
        } catch (err) {
            console.error(`Não foi possivel recuperar o token de acesso da nossa fintech: ${err}`);
        }
    }
    async Simulacao(cpf, userId, id_consulta_lote) {
        //userUsername
        try {
            const players = [
                { code: "qi", enabled: true },
                { code: "bmp", enabled: true }
            ];

            let responseSaldo = null;
            let responseSimulacao = null;
            let lastError = null;
            let usedPlayer = null;
            let tabelaSelecionada;

            // for que percorre os players para consulta de saldo
            for (const { code, enabled } of players) {
                await new Promise(resolve => setTimeout(resolve, 2000));

                if (!enabled) continue;

                try {
                    console.log(`Consultando o saldo na "Nossa fintech" com o player: ${code}...`);

                    // manda request para rota de verificar saldo
                    responseSaldo = await axios.post(`${process.env.NossaFintech_baseURL}/nossa/v1/balance`,
                        {
                            cpf: cpf,
                            service_type: code.trim()
                        },
                        {
                            // timeout: 45_000,
                            headers: {
                                'Authorization': `Bearer ${this.accessToken}`,
                            }
                        }
                    )

                    usedPlayer = code.trim();

                    // consulta as tabelas disponíveis
                    const tabelasDisponiveis = await axios.post(`${process.env.NossaFintech_baseURL}/nossa/v2/simulation`,
                        {
                            cpf: cpf,
                            key: responseSaldo.data.key,
                            number_of_installments: responseSaldo.data.data.periods.length,
                            eligibility: responseSaldo.data.eligible,
                            service_type: usedPlayer
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${this.accessToken}`,
                            }
                        }
                    )

                    // console.log(tabelasDisponiveis.data);

                    if (code.trim() == "qi") {
                        tabelaSelecionada = tabelasDisponiveis.data.find(t => t.cod_produto === 104) || tabelasDisponiveis.data.find(t => t.cod_produto === 101);
                    } else if (code.trim() == "bmp") {
                        tabelaSelecionada = tabelasDisponiveis.data.find(t => t.cod_produto === 106);
                    }

                    if (!tabelaSelecionada) throw new HttpException('Cliente sem oferta disponível nem na tabela "NOSSA MELHOR" e nem na "VENDA MAIS".')
                    // console.log(tabelaSelecionada);

                    break;
                } catch (err) {
                    console.error(`O player ${code} falhou em concluir a simulacao`);
                    // console.log(err.response.data)
                    lastError = err;
                }
            }

            if (lastError != null || responseSaldo.data?.status == "failed" || responseSaldo.data?.status == "fail" || responseSaldo.data?.data?.error_message_ptBR) {

                const ptBR = responseSaldo.data?.data?.error_message_ptBR;
                const desc = responseSaldo?.data?.data?.error_description;

                let msg = null;

                // fazendo esse tratamento porco pq a API parceira n ajuda
                if (typeof ptBR === "string" && ptBR.trim() !== "") {
                    msg = ptBR;
                } else if (typeof desc === "string" && desc.trim() !== "") {
                    console.log("else if disparado");
                    msg = desc;
                } else {
                    // imprimindo o log pq n sei exatamente como tratar esse erro
                    console.log(lastError?.data);
                    msg = "Erro desconhecido na API parceira.";
                }

                console.log(msg)

                throw new HttpException(msg, 424);
            }

            // limpando o lastError
            lastError = null;

            // tenta simular com o msm player que funcionou na consulta de saldo
            try {
                console.log(`Simulando Nossa Fintech com o player: ${usedPlayer}...`)

                const bodySimulacao = ({
                    cpf: cpf,
                    key: responseSaldo.data.key,
                    number_of_installments: responseSaldo.data.data.periods.length,
                    eligibility: responseSaldo.data.eligible,
                    cod_produto: tabelaSelecionada.cod_produto,
                    service_type: usedPlayer
                });

                // manda request para simular
                responseSimulacao = await axios.post(`${process.env.NossaFintech_baseURL}/nossa/v1/simulation`,
                    bodySimulacao,
                    {
                        timeout: 45_000,
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        }
                    }
                )
            } catch (err) {
                console.error(`O player ${usedPlayer} falhou em concluir a simulacao`);

                lastError = err;
            }

            if (lastError != null) {
                // console.log(lastError);
                const msg = lastError.response?.data?.data?.error_message_ptBR ?? "Não foi possível realizar a simulação devido a falha na instituição parceira.";
                throw new HttpException(msg, 424);
            }

            // tratando erro das parcelas vazias
            if (responseSimulacao.data.installments.length == 0) {
                const msg = "Cliente é inelegível pois, o prazo para o primeiro desconto é superior a 24 meses";
                throw new HttpException(msg, 424);
            }

            let valorTac = null;
            let fees = responseSimulacao?.data.external_contract_fees ?? []

            if (fees.length && fees[0]?.fee_type === "tac") {
                fees.forEach(item => {
                    valorTac = valorTac + item.fee_amount;
                });
            }

            const resultBuscaCliente = await ClientesService.procurarCpf(cpf);
            if (!resultBuscaCliente || resultBuscaCliente?.length === 0) {
                const dadosCliente = await NovaVidaService.BuscarDados(cpf);

                if (dadosCliente.CONSULTA == "Não Autorizado") {
                    throw new HttpException("Não foi possível recuperar os dados do cliente na API do Nova Vida, será necessário fazer o cadastro do cliente manualmente.", 424);
                }

                await ClientesService.criarClienteNovaVida(dadosCliente, cpf);
            }
            const cliente = await ClientesService.procurarCpf(cpf);

            const bodyDB = {
                cliente_id: cliente.id,
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
                usuario_id: userId,
                chave: responseSimulacao.data.key,
                banco: usedPlayer,
                API: "Nossa fintech",
                mensagem: "Consulta realizada com sucesso!",
                elegivelProposta: true,
                id_consulta_lote: id_consulta_lote
            }

            let bodyRetorno = {};
            const consultaDuplicada = await ConsultasFGTSRepository.SearchDuplicates(cliente.cpf, bodyDB.banco, bodyDB.API);
            if (consultaDuplicada) {
                const bodyUpdate = ({
                    id: consultaDuplicada.dataValues.id,

                    ...bodyDB
                })

                await ConsultasFGTSRepository.Update(consultaDuplicada.dataValues.id, bodyUpdate);

                const objConsultaDB = await ConsultasFGTSRepository.SearchDuplicates(cliente.cpf, bodyDB.banco, bodyDB.API);

                // adicionando o obj de cliente no body de retorno
                bodyRetorno = ({
                    ...objConsultaDB.dataValues,
                    cliente: cliente.dataValues
                })

                return bodyRetorno;
            }

            // adicionando o obj de cliente no body de retorno
            const novoRegistro = await ConsultasFGTSRepository.Create(bodyDB);

            bodyRetorno = ({
                ...novoRegistro.dataValues,
                cliente: cliente.dataValues
            })

            return bodyRetorno;
        } catch (err) {
            // console.log(err);
            let status = 500;
            let message = "Erro inesperado ao realizar a simulação";

            if (axios.isAxiosError(err)) {
                status = 424;
                message = err.response?.data?.data?.error_message_ptBR ?? message;
            } else if (err instanceof HttpException) {
                message = err.message;
                status = err.status;
            }

            const resultBuscaCliente = await ClientesService.procurarCpf(cpf);
            if (!resultBuscaCliente || resultBuscaCliente?.length === 0) {
                const dadosCliente = await NovaVidaService.BuscarDados(cpf);

                if (dadosCliente.CONSULTA == "Não Autorizado") {
                    throw new HttpException("Não foi possível recuperar os dados do cliente na API do Nova Vida, será necessário fazer o cadastro do cliente manualmente.", 424);
                }

                await ClientesService.criarClienteNovaVida(dadosCliente, cpf);
            }

            const cliente = await ClientesService.procurarCpf(cpf);

            const response = {
                cliente_id: cliente.id,
                anuidades: null,
                saldo: null,
                valor_bruto: null,
                valor_liquido: null,
                valor_tac: null,
                valor_seguro: null,
                tabela: "Tabela Nossa Melhor",
                usuario_id: userId,
                chave: null,
                banco: null,
                API: "Nossa fintech",
                mensagem: message,
                elegivelProposta: false,
                id_consulta_lote: id_consulta_lote
            };

            await ConsultasFGTSRepository.Create(response);

            throw new HttpException(message, status);
        }
    }
    async Proposta(data, userId) {
        try {
            const verifica = await ConsultasFGTSRepository.SearchByFinancialId(data.financialId);

            if (!verifica) {
                throw new HttpException("Nenhuma proposta encontrada com esse financialId", 404);
            }

            const resultBuscaCliente = await ClientesService.procurarCpf(data.cpf);
            if (!resultBuscaCliente || resultBuscaCliente?.length === 0) {
                const dadosCliente = await NovaVidaService.BuscarDados(data.cpf);

                if (dadosCliente.CONSULTA == "Não Autorizado") {
                    throw new HttpException("Não foi possível recuperar os dados do cliente na API do Nova Vida, será necessário fazer o cadastro do cliente manualmente.", 424);
                }

                await ClientesService.criarClienteNovaVida(dadosCliente, data.cpf);
            }

            const cliente = await ClientesService.procurarCpf(data.cpf);
            const cliente_ddd = cliente.dataValues.celular.slice(0, 2);
            const cliente_celular = cliente.dataValues.celular.slice(2);
            let banco = null;

            if (data.bankCode != null && data.bankCode != "") {
                banco = await ISPBRepository.findByCod(data.bankCode);
                if (banco == null) {
                    throw new HttpException("Banco não encontrado", 404);
                }
            }

            const reqBody = ({
                simulation_key: data.financialId,
                service_type: verifica.banco,
                client: {
                    person_name: cliente.dataValues.nome,
                    mother_name: "Maria da Silva",
                    birth_date: cliente.dataValues.data_nasc,
                    profession: "",
                    nationality: "Brasileiro",
                    marital_status: "single",
                    email: "example@gmail.com",
                    country_code: "55",
                    area_code: cliente_ddd,
                    phone_number: cliente_celular,
                    street: "Rua exemplo",
                    state: "SP",
                    city: "Santo Andre",
                    neighborhood: "Bairro top",
                    number: "1",
                    postal_code: "99999999",
                    complement: "",
                    bank_account: [

                        // monta 2 bodys diferentes dependendo se tiver chave pix ou nao
                        {
                            ...(data.pixKeyType == null && {
                                ispb_number: banco.ISPB,
                                account_type: data.accountType,
                                branch_number: data.branchNumber,
                                account_number: data.accountNumber,
                                account_digit: data.accountDigit,
                                pix_transfer_type: "manual"
                            }),

                            ...(data.pixKeyType != null && data.pixKey != null && {
                                pix_transfer_type: "key",
                                pix_key_type: data.pixKeyType,
                                pix_key: data.pixKey
                            }),
                        }
                    ]
                }
            });

            // enviando a requisicao para a API
            const responseProposta = await axios.post(`${process.env.NossaFintech_baseURL}/nossa/v1/proposal`,
                reqBody,
                {
                    // timeout: 45_000,
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            );

            const bodyDB = ({
                cliente_id: cliente.id,
                proposal_id: responseProposta.data.debt_key,
                link_form: responseProposta.data.link_form,
                valor_liquido: responseProposta.data.val_liquido,
                valor_seguro: responseProposta.data.val_seguro,
                valor_emissao: responseProposta.data.val_emissao,
                contrato: responseProposta.data.ccb_pdf,
                numero_contrato: responseProposta.data.num_contrato,
                usuario_id: userId,
                banco: verifica.banco,
                API: "Nossa fintech",
                status_proposta: "Criado",
                msg_status: responseProposta.data.dsc_situacao_emprestimo,
                verificar: 1
            })

            await PropostasRepository.create(bodyDB);

            const consulta = await ConsultasFGTSRepository.SearchByFinancialId(data.financialId);
            const newBodyConsulta = ({
                ...consulta,

                elegivelProposta: 0,
                mensagem: "Já foi digitada uma proposta para esse cliente, refaça a simulação se quiser fazer uma nova proposta."
            })

            await ConsultasFGTSRepository.UpdateByFinancialId(data.financialId, newBodyConsulta);

            return;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = 424;
                const message = err.response?.data?.message || "Erro desconhecido.";

                throw new HttpException(message, status);
            }

            if (err instanceof HttpException) {
                throw new HttpException(err.message, err.status);
            }

            throw new HttpException(err.message, 500);
        }
    }
    async VerificarTodasAsPropostas() {
        try {
            const propostas = await PropostasRepository.findAllParaVerificar("Nossa fintech");

            for (const { proposal_id } of propostas) {
                await this.AtualizarRegistroPropostaDB(proposal_id);

                await new Promise(resolve => setTimeout(resolve, 5000));
            };

            TaskScheduler.schedule("Verificar propostas da Nossa fintech", () => this.VerificarTodasAsPropostas(), 600000);
        } catch (err) {
            console.error(`Não foi possível verificar as propostas da Nossa fintech: ${err}`);
        }
    }
    async VerificarApenasUmaProposta(proposalId) {
        try {
            await this.AtualizarRegistroPropostaDB(proposalId);

            const response = await PropostasRepository.findOne(proposalId);

            return response;
        } catch (err) {
            console.error('Erro ao atualizar proposta:', err);

            throw err;
        }
    }
    async CancelarProposta(proposalId) {
        try {
            await axios.post(`${process.env.NossaFintech_baseURL}/nossa/v1/cancel_operation`,
                {
                    "debt_key": proposalId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            )

            // delay pra n torar o servidor deles
            await new Promise(resolve => setTimeout(resolve, 3000));
            await this.AtualizarRegistroPropostaDB(proposalId);

            const response = await PropostasRepository.findOne(proposalId);

            return response;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = 424;
                const message = err.response?.data?.message || "Erro desconhecido.";

                throw new HttpException(message, status);
            }

            if (err instanceof HttpException) {
                throw new HttpException(err.message, err.status);
            }
        }
    }
    async AtualizarRegistroPropostaDB(proposalId) {
        try {
            const STATUS_FINALIZADOS = new Set([
                "Cancelado Permanentemente",
                "Operação cancelada",
                "Cancelado",

                // verificar funcionalidade depois
                "Operação desembolsada (paga)"
            ]);

            const dadosAntigosRaw = await PropostasRepository.findOne(proposalId);
            const dadosAntigos = dadosAntigosRaw.dataValues;

            const dadosNovos = await axios.get(`${process.env.NossaFintech_baseURL}/nossa/v1/proposal/${proposalId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            )

            const ultimoHistorico = dadosNovos.data.history.at(-1);

            if (!ultimoHistorico) {
                throw new HttpException('Histórico vazio na API nossa fintech', 424);
            }

            // faz o ternario para saber se ainda precisa verificar a proposta
            const verificar = !STATUS_FINALIZADOS.has(ultimoHistorico.status)

            const proposalAtualizada = ({
                ...dadosAntigos,

                status_proposta: ultimoHistorico.status,
                msg_status: ultimoHistorico.description,
                data_status: ultimoHistorico.event_datetime,
                verificar
            })

            await PropostasRepository.update(proposalId, proposalAtualizada)
        } catch (err) {
            throw err;
        }
    }


    // ============================================
    //                     CLT
    // ============================================
    async RecuperarBancarizadoras() {
        try {
            const response = await axios.get(`${process.env.NossaFintech_baseURL}/clt-loan/v1/banking-institutions`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            );

            return response.data.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = 424;
                const message = err.response?.data?.message || "Erro desconhecido.";

                throw new HttpException(message, status);
            }

            if (err instanceof HttpException) {
                throw new HttpException(err.message, err.status);
            }

            throw new HttpException(err.message, 500);
        }
    }
    async GerarTermoAutorizacao(cpf, banco) {
        try {
            // verificando se da pra puxar os dados do cliente, evitar merda mais para frente
            const resultBuscaCliente = await ClientesService.procurarCpf(cpf);
            if (!resultBuscaCliente || resultBuscaCliente?.length === 0) {
                const dadosCliente = await NovaVidaService.BuscarDados(cpf);

                if (dadosCliente.CONSULTA == "Não Autorizado") {
                    throw new HttpException("Não foi possível recuperar os dados do cliente na API do Nova Vida, será necessário fazer o cadastro do cliente manualmente.", 424);
                }

                await ClientesService.criarClienteNovaVida(dadosCliente, cpf);
            }

            const response = await axios.post(`${process.env.NossaFintech_baseURL}/clt-loan/v1/request-authorization`,
                {
                    document_number: cpf,
                    person_name: "MARIA DA SILVA",
                    country_code: "55",
                    area_code: "11",
                    phone_number: "999999999",
                    notification_method: "sms",
                    service_type: banco.trim()
                },
                {
                    // timeout: 45_000,
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            );

            return response?.data?.data?.authorization_link;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = 424;
                const message = err.response?.data?.error || "Erro desconhecido.";

                throw new HttpException(message, status);
            }

            if (err instanceof HttpException) {
                throw new HttpException(err.message, err.status);
            }

            throw new HttpException(err.message, 500);
        }
    }
    async ConsultarVinculoMargemTabela(cpf, banco) {
        try {
            // verificando se da pra puxar os dados do cliente, evitar merda mais para frente
            const resultBuscaCliente = await ClientesService.procurarCpf(cpf);
            if (!resultBuscaCliente || resultBuscaCliente?.length === 0) {
                const dadosCliente = await NovaVidaService.BuscarDados(cpf);

                if (dadosCliente.CONSULTA == "Não Autorizado") {
                    throw new HttpException("Não foi possível recuperar os dados do cliente na API do Nova Vida, será necessário fazer o cadastro do cliente manualmente.", 424);
                }

                await ClientesService.criarClienteNovaVida(dadosCliente, cpf);
            }

            const statusAutorizacao = await this.#consultarStatusAutorizacao(cpf, banco);
            // console.log(`status recuperado: ${statusAutorizacao}`);
            if (statusAutorizacao !== "AUTHORIZED") {
                throw new HttpException("Sem autorização para consulta de vinculo de margem, use o end-point para gerar a autorização primeiro.", 424);
            }

            const vinculos = await this.#consultarVinculos(cpf, banco);

            let vinculosMargensTabelas = [];
            for (const vinculo of vinculos) {
                // timeout leve
                await new Promise(resolve => setTimeout(resolve, 2000));

                const margem = await this.#consultarMargem(cpf, banco, vinculo.employer_cnpj);

                const tabelas = await this.#recuperarTabelasElegiveis(margem.margin_key, banco);

                vinculosMargensTabelas.push({
                    ...vinculo,
                    margem,
                    tabelas
                });
            }

            // Mapeia todos os vínculos para o formato desejado
            return vinculosMargensTabelas.map(vinculo =>
                this.#mapearRetornoConsultaVinculo(cpf, vinculo)
            );
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = 424;
                const message = err.response?.data?.message || "Erro desconhecido.";

                throw new HttpException(message, status);
            }

            if (err instanceof HttpException) {
                throw new HttpException(err.message, err.status);
            }

            throw new HttpException(err.message, 500);
        }
    }
    async SimularProposta(data) {
        try {
            const response = await axios.post(`${process.env.NossaFintech_baseURL}/clt-loan/v1/simulate-loan`,
                {
                    margin_key: data.idTermo,
                    simulation_type: "Payment",
                    employer_document: data.cnpj_empregador,
                    requested_amount: data.valorParcelas,
                    service_type: data.banco.trim(),
                    cod_tabela: data.tabelaId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            );

            return {
                id_simulacao: response?.data?.data?.simulation_key,
                valor_total: (response?.data?.data?.disbursement_amount) / 100,
                qtd_parcelas: response?.data?.data?.num_periods,
                valor_parcelas: data.valorParcelas,
                first_payment_date: response?.data?.data?.first_payment_date,
                taxa_aplicada: +((response?.data?.data?.interest_rate) * 100).toFixed(2),
            };
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = 424;
                const message = err.response?.data?.message || "Erro desconhecido.";

                throw new HttpException(message, status);
            }

            if (err instanceof HttpException) {
                throw new HttpException(err.message, err.status);
            }

            throw new HttpException(err.message, 500);
        }
    }
    async CriarProposta(data, usuarioId) {
        try {
            const resultBuscaCliente = await ClientesService.procurarCpf(data.cpf);
            if (!resultBuscaCliente || resultBuscaCliente?.length === 0) {
                const dadosCliente = await NovaVidaService.BuscarDados(cpf);

                if (dadosCliente.CONSULTA == "Não Autorizado") {
                    throw new HttpException("Não foi possível recuperar os dados do cliente na API do Nova Vida, será necessário fazer o cadastro do cliente manualmente.", 424);
                }

                await ClientesService.criarClienteNovaVida(dadosCliente, cpf);
            }
            const cliente = await ClientesService.procurarCpf(data.cpf);
            const cliente_ddd = cliente.dataValues.celular.slice(0, 2);
            const cliente_celular = cliente.dataValues.celular.slice(2);

            const bodyRequest = {
                simulation_key: data.simulacaoId,
                service_type: data.banco.trim(),
                employer_document: data.cnpj_empregador,
                client: {
                    document_number: data.cpf,
                    person_name: cliente.dataValues.nome,
                    gender: "FEMALE",
                    mother_name: "MARIA DE LOURDES DA SILVA",
                    birth_date: cliente.dataValues.data_nasc,
                    profession: data.profissão,
                    nationality: "Brasileiro",
                    marital_status: "Solteiro",
                    email: "example@example.com",
                    country_code: "+55",
                    area_code: cliente_ddd,
                    phone_number: cliente_celular,
                    street: "Rua direita",
                    state: "SP",
                    city: "São Paulo",
                    neighborhood: "Sé",
                    number: "199",
                    postal_code: "01002000",
                    complement: "",

                    bank_account: {
                        pix_transfer_type: "manual",
                        bank_code: "033",
                        branch_number: "0060",
                        account_number: "01098440",
                        account_type: "CHECKING",
                        account_digit: "6"
                    },
                    // monta 2 bodys diferentes dependendo se tiver chave pix ou nao
                    bank_account: {


                        ...(data.pixKeyType == null && {
                            pix_transfer_type: "manual",
                            bank_code: data.bankCode,
                            branch_number: data.branchNumber,
                            account_number: data.accountNumber,
                            account_type: data.accountType.toUpperCase(), // Atenção: CLT pede maiúsculo (ex: "CHECKING")
                            account_digit: data.accountDigit
                        }),

                        // Monta as propriedades de PIX se houver chave PIX
                        ...(data.pixKeyType != null && data.pixKey != null && {
                            pix_transfer_type: "key",
                            pix_key_type: data.pixKeyType,
                            pix_key: data.pixKey
                        })
                    },
                    id_document: {
                        issue_date: "2010-05-20",
                        issuer: "SSP-SP",
                        number: "9999999999",
                        type: "RG"
                    }
                }
            };

            const response = await axios.post(`${process.env.NossaFintech_baseURL}/clt-loan/v1/submit-proposal`,
                bodyRequest,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            );

            const bodyDB = {
                cliente_id: cliente.dataValues.id,
                nome_tabela: "Consignado CLT C/ Seguro",
                id_proposta: response?.data?.data?.num_proposta,
                link_form: response?.data?.data?.link_form,
                contrato: response?.data?.data?.ccb_pdf,
                numero_contrato: response?.data?.data?.num_contrato,
                usuario_id: usuarioId,
                qtd_parcelas: response?.data?.data?.qtd_parcela,
                valor_parcelas: data.valor_parcelas,
                taxa_juros_mensal: data.taxa_aplicada,
                valor_solicitado: response?.data?.data?.val_emissao,
                valor_liberado: response?.data?.data?.val_liquido,
                status_nome: response?.data?.data?.status,
                status_id: "",
                produto_nome: response?.data?.data?.dsc_produto || "VALOR_NAO_ENCONTRADO",
                produto_id: response?.data?.data?.cod_produto,
                status_historicos: "",
                verificar: true,
                banco: data.banco.trim(),
                API: "Nossa fintech"
            };

            console.log("Response data crua:")
            console.log(response.data)

            console.log("Body para o DB:")
            console.log(bodyDB);

            await PropostasCLTRepository.create(bodyDB);

            return {
                msg: "Proposta criada com sucesso!",
                link_form: response?.data?.data?.link_form
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = 424;
                const message = err.response?.data?.message || "Erro desconhecido.";

                throw new HttpException(message, status);
            }

            if (err instanceof HttpException) {
                throw new HttpException(err.message, err.status);
            }

            throw new HttpException(err.message, 500);
        }
    }
    async VerificarTodasAsPropostasCLT() {
        try {
            const propostasParaVerificar = await PropostasCLTRepository.findAllParaVerificar("Nossa fintech");

            for (const { id_proposta } of propostasParaVerificar) {
                await this.#verificarUmEAtualizarRegistroPropostaDB(id_proposta);

                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            TaskScheduler.schedule("Verificar propostas do Nossa fintech CLT", () => this.VerificarTodasAsPropostas(), 300000);
        } catch(err) {
            console.error(`Não foi possível verificar as propostas do Nossa fintech CLT: ${err}`);
        }
    }

    // funções privadas
    async #consultarStatusAutorizacao(cpf, banco) {
        try {
            const response = await axios.post(`${process.env.NossaFintech_baseURL}/clt-loan/v1/check-authorization`,
                {
                    document_number: cpf,
                    service_type: banco.trim()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            );

            return response?.data?.data?.status;
        } catch (err) {
            throw err;
        }
    }
    async #consultarVinculos(cpf, banco) {
        try {
            const response = await axios.post(`${process.env.NossaFintech_baseURL}/clt-loan/v1/check-employee-enrollment`,
                {
                    document_number: cpf,
                    service_type: banco.trim()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            );

            if(!response?.data?.success) {
                throw new HttpException(response?.data?.message || "Erro desconhecido ao consultar os vínculos empregatícios", 424);
            }

            // retorna o array com todos os vinculos
            return response?.data?.data ?? [];
        } catch (err) {
            throw err;
        }
    }
    async #consultarMargem(cpf, banco, cnpj) {
        try {
            const response = await axios.post(`${process.env.NossaFintech_baseURL}/clt-loan/v1/get-margin`,
                {
                    document_number: cpf,
                    service_type: banco.trim(),
                    employer_document: cnpj
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            );

            // capturando possível erro
            if(!response?.data?.success) {
                throw new HttpException(response?.data?.message || "Erro desconhecido ao consultar margem", 424);
            }

            return response?.data?.data;
        } catch (err) {
            throw err;
        }
    }
    async #recuperarTabelasElegiveis(margin_key, banco) {
        try {
            const response = await axios.get(`${process.env.NossaFintech_baseURL}/clt-loan/v1/list-rebates`,
                {
                    params: {
                        service_type: banco.trim(),
                        margin_key: margin_key
                    },
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            );

            if(!response?.data?.success) {
                throw new HttpException(response?.data?.message || "Erro desconhecido ao consultar as tabelas disponíveis", 424);
            }

            let tabelasDisponiveis = response?.data?.data ?? [];

            // regra NOSSA: só tabelas com seguro
            tabelasDisponiveis = tabelasDisponiveis.filter(tabela =>
                tabela.name.toUpperCase().includes('C/ SEGURO')
            );

            return tabelasDisponiveis;

        } catch (err) {
            throw err;
        }
    }
    #mapearRetornoConsultaVinculo(cpf, vinculo) {
        const { work_registration, employer_cnpj, margem, tabelas } = vinculo;

        // Extrai o gênero (primeira letra maiúscula)
        const sexo = margem.gender.description.charAt(0).toUpperCase();

        return {
            cpf: cpf,
            idTermo: margem.margin_key,
            cnpjEmpregador: employer_cnpj,
            matricula: work_registration,
            profissao: margem.job_code.description,
            dataAdmissao: margem.admission_date,
            valorMargemAvaliavel: margem.utilizable_balance.toString(),
            valorBaseMargem: margem.base_margin_value ? margem.base_margin_value.toString() : null,
            valorTotalVencimentos: margem.total_gross_salary ? margem.total_gross_salary.toString() : null,
            nomeMae: margem.mother_name,
            sexo: sexo,
            tabelasElegiveis: tabelas
        };
    }
    async #verificarUmEAtualizarRegistroPropostaDB(proposalId) {
        try {
            const STATUS_FINALIZADOS = new Set([
                "Desembolsado",
                "Cancelado",
                "Cancelado Permanentemente"
            ]);

            const proposalData = await axios.get(`${process.env.NossaFintech_baseURL}/clt-loan/v1/get-operation-details/${proposalId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    },
                }
            )

            // dados do DB
            const propostaDB = await PropostasCLTRepository.findOneByProposalId(proposalId);

            // novos dados
            const verificar = !STATUS_FINALIZADOS.has(proposalData?.data?.data?.status);
            const historicoStatus = proposalData?.data?.data?.history;
            const link_form = proposalData?.data?.data?.link_form;
            const status = proposalData?.data?.data?.status;

            const dadosAtualizados = {
                ...propostaDB,

                link_form: link_form,
                status_nome: status,
                verificar: verificar,
                status_historicos: historicoStatus
            }

            return await PropostasCLTRepository.updateByProposalId(proposalId, dadosAtualizados);
        } catch(err) {
            throw err;
        }
    }

    getToken() {
        return this.accessToken;
    }
}

export default new NossaFintechService();