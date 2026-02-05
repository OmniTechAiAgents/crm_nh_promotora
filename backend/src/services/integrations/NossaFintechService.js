import axios from 'axios';
import TokenAPIsRepository from '../../repositories/TokenAPIsRepository.js';
import IsTokenExpired from '../../utils/IsTokenExpired.js';
import TaskScheduler from '../../utils/TaskScheduler.js';
import HttpException from '../../utils/HttpException.js';
import ConsultasFGTSRepository from '../../repositories/ConsultasFGTSRepository.js';
import ClientesService from '../ClientesService.js';
import ISPBRepository from '../../repositories/ISPBRepository.js';
import PropostasRepository from '../../repositories/PropostasRepository.js';


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
            const players = [
                { code: "qi", table: 101 , enabled: true },
                { code: "bmp", table: 106, enabled: false }
            ];

            let responseSaldo = null;
            let responseSimulacao = null;
            let lastError = null;
            let usedPlayer = null;

            for(const { code, table, enabled } of players) {
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
                    break;
                } catch(err) {
                    console.error(`O player ${code} falhou em concluir a simulacao`);
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
                    msg = "fodase";
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
                    cod_produto: players.find(p => p.code === usedPlayer)?.table,
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
                const msg = lastError.response?.data?.data?.error_message_ptBR ?? "Não foi possível realizar a simulação devido a falha na instituição parceira.";
                throw new HttpException(msg, 424);
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
                banco: usedPlayer,
                API: "Nossa fintech",
                mensagem: "Consulta realizada com sucesso!",
                elegivelProposta: true
            }

            const retorno = await ConsultasFGTSRepository.Create(bodyDB);

            return retorno;
        } catch (err) {
            let status = 500;
            let message = "Erro inesperado ao realizar a simulação";
            
            if (axios.isAxiosError(err)) {
                status = 424;
                message = err.response?.data?.data?.error_message_ptBR ?? message;
            } else if (err instanceof HttpException) {
                message = err.message;
                status = err.status;
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
                API: "Nossa fintech",
                mensagem: message,
                elegivelProposta: false
            };

            await ConsultasFGTSRepository.Create(response);

            throw new HttpException(message, status);
        }
    }

    async Proposta(data, userUsername) {
        try {
            const verifica = await ConsultasFGTSRepository.SearchByFinancialId(data.financialId);

            if(!verifica) {
                throw new HttpException("Nenhuma proposta encontrada com esse financialId", 404);
            }

            const cliente = await ClientesService.procurarCpf(data.cpf);
            const cliente_ddd = cliente.dataValues.celular.slice(0, 2);
            const cliente_celular = cliente.dataValues.celular.slice(2);
            const banco = await ISPBRepository.findByCod(data.bankCode);
        
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
                nome: responseProposta.data.nom_cliente,
                cpf: responseProposta.data.cod_cpf_cliente,
                cel: responseProposta.data.num_telefone_celular.replace(/^\+55/, ''),
                data_nascimento: responseProposta.data.dat_nascimento,
                proposal_id: responseProposta.data.debt_key,
                link_form: responseProposta.data.link_form,
                valor_liquido: responseProposta.data.val_liquido,
                valor_seguro: responseProposta.data.val_seguro,
                valor_emissao: responseProposta.data.val_emissao,
                contrato: responseProposta.data.ccb_pdf,
                numero_contrato: responseProposta.data.num_contrato,
                usuario: userUsername,
                banco: verifica.banco,
                API: "Nossa fintech",
                status_proposta: "Criado",
                msg_status: responseProposta.data.dsc_situacao_emprestimo,
                verificar: 1
            })

            await PropostasRepository.create(bodyDB);

            return;
        } catch (err) {
            if(axios.isAxiosError(err)) {
                const status = 424;
                const message = err.response?.data?.message || "Erro desconhecido.";

                throw new HttpException(message, status);
            }

            if(err instanceof HttpException) {
                throw new HttpException(err.message, err.status);
            }

            throw new HttpException(err.message, 500);
        }
    }

    async VerificarApenasUmaProposta(proposalId) {
        try {
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

            const proposalAtualizada = ({
                ...dadosAntigos,

                status_proposta: ultimoHistorico.status,
                msg_status: ultimoHistorico.description,
                data_status: ultimoHistorico.event_datetime
            })

            await PropostasRepository.update(proposalId, proposalAtualizada );
        } catch (err) {
            console.error('Erro ao atualizar proposta:', err);

            throw err;
        }
    }

    getToken() {
        return this.accessToken;
    }
}

export default new NossaFintechService();