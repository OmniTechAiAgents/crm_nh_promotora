import axios from 'axios';
import TokenAPIsRepository from '../../repositories/TokenAPIsRepository.js';
import IsTokenExpired from '../../utils/IsTokenExpired.js';
import TaskScheduler from '../../utils/TaskScheduler.js';
import HttpException from '../../utils/HttpException.js';
import ConsultasFGTSRepository from '../../repositories/ConsultasFGTSRepository.js';
import SimulateFGTS from '../../utils/SimulateFGTS.js';
import ClientesService from '../ClientesService.js';

import PropostasRepository from '../../repositories/PropostasRepository.js';

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

            console.log("Recuperando um novo token VCTex.")

            const response = await axios.post(`${process.env.VCTex_baseURL}/authentication/login`, {
                cpf: process.env.VCTEX_user,
                password: process.env.VCTEX_password
            });

            const TokenData = {
                nome_api: "vctex",
                tipo_api: "fgts",
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
            // desativar algum se a API for chata com requisicoes enviadas rapidamente
            const players = [
                { code: "QITECH", enabled: true },
                { code: "CDC", enabled: true },
                { code: "QITECH_DTVM", enabled: true }
            ];

            const tables = [
                { code: 0, name: "Tabela exponencial" },
                { code: 4, name: "Vendex" },
                { code: 26, name: "Tabela vamo com tudo" },
                { code: 27, name: "Tabela Relax" },
                { code: 31, name: "Tabela vamo com tudo com seguro" }
            ]

            // setando as flags que vao ser usadas dentro do foreach
            let rawResponse = null;
            let usedPlayer = null;
            let lastError = null;
            let newPossibleTable = null;

            for (const { code, enabled } of players) {
                // timeout para impedir erro das APIs parceiras'
                await new Promise(resolve => setTimeout(resolve, 2000));

                if (!enabled) continue;

                try {
                    console.log(`Simulando VCTex com o player: ${code}...`)

                    rawResponse = await SimulateFGTS({
                        url: `${process.env.VCTex_baseURL}/service/simulation`,
                        cpf: cpf,
                        feeScheduleId: 0,
                        player: code.trim(),
                        accessToken: this.accessToken,
                        timeout: 30_000
                    })

                    usedPlayer = code;

                    // 1 - verifica se no body de retorno veio true para alguma tabela elegivel
                    if (rawResponse.data.data.isExponentialFeeScheduleAvailable) {
                        newPossibleTable = 0;
                    } else if (rawResponse.data.data.isVendexFeeScheduleAvailable) {
                        newPossibleTable = 4;
                    }

                    break;
                } catch(err) {
                    console.error(`O player ${code} falhou em concluir a simulacao`);
                    lastError = err;
                }
            }

            // refaz a query usando uma tabela melhor se for elegivel
            if (newPossibleTable != null) {
                try {
                    rawResponse = await SimulateFGTS({
                        url: `${process.env.VCTex_baseURL}/service/simulation`,
                        cpf: cpf,
                        feeScheduleId: newPossibleTable,
                        player: usedPlayer,
                        accessToken: this.accessToken,
                        timeout: 30_000
                    })
                } catch(err) {
                    console.error(`Erro ao concluir simulação com a nova tabela.`);
                    lastError = err;
                }
            }

            // captura falha direta do axios
            if (!rawResponse) {
                throw lastError || new Error("Falha ao realizar simulação");
            }
            
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
                banco: usedPlayer,
                mensagem: "Consulta realizada com sucesso!",
                elegivelProposta: true
            }

            const retorno = await ConsultasFGTSRepository.Create(response);

            return retorno;
        } catch (err) {
            let status = 500;
            let message = "Erro inesperado ao realizar a simulação";

            if (axios.isAxiosError(err)) {
                status = 424;
                message = err.response?.data?.message ?? message;
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
                tabela: "Tabela Exponencial",
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

    async Proposta(data, userUsername) {
        try {
            // logica completa para mandar a proposta para a VCTex
            const verifica = await ConsultasFGTSRepository.SearchByFinancialId(data.financialId);
            if (!verifica) {
                throw new HttpException("Nenhuma proposta encontrada com esse financialId", 404);
            }

            const cliente = await ClientesService.procurarCpf(data.cpf);

            const reqBody = ({
                feeScheduleId: 0,
                financialId: data.financialId,
                borrower: {
                    name: cliente.dataValues.nome,
                    cpf: cliente.dataValues.cpf,
                    birthdate: cliente.dataValues.data_nasc,
                    gender: "male",
                    phoneNumber: cliente.dataValues.celular,
                    email: "exemple@gmail.com",
                    maritalStatus: "single",
                    nationality: "brazilian",
                    naturalness: "brazilian",
                    motherName: "Maria da Silva",
                    fatherName: "Josué Santos do Nascimento",
                    pep: false
                },
                document: {
                    type: "rg",
                    number: "999999999",
                    issuingState: "SP",
                    issuingAuthority: "SSP", 
                    issueDate: "2023-01-01"
                },
                address: {
                    zipCode: "99999999",
                    street: "Rua exemplo",
                    number: "1",
                    complement: null,
                    neighborhood: "Bairro top",
                    city: "Santo Andre",
                    state: "SP"
                },
                disbursementBankAccount: {
                    bankCode: data.bankCode,
                    accountType: data.accountType,
                    accountNumber: data.accountNumber,
                    accountDigit: data.accountDigit,
                    branchNumber: data.branchNumber,
                    pixKey: data.pixKey,
                    pixKeyType: data.pixKeyType
                }
            })

            const response = await axios.post(`${process.env.VCTex_baseURL}/service/proposal`, 
                reqBody,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // tenta verificar se o status id da proposta é 60 em 3 tentativas
            for(let i = 0; i < 3; i++) {
                // timeout de 10s
                await new Promise(resolve => setTimeout(resolve, 10000));

                // verifica se o status id da proposta ja ta em 60
                const statusIdProposta = await axios.get(`${process.env.VCTex_baseURL}/service/proposal/status/${response.data.data.proposalId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                        }
                    }
                )

                if (statusIdProposta.data.proposalStatusId == 60) {
                    break;
                }
            }
            
            // apos verificar o status, passa para recuperar as informacoes com o link de formalizacao
            await this.AtualizarRegistroPropostaDB(response.data.data.proposalcontractNumber, response.data.data.proposalId, userUsername)

            return true;
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

    async CancelarProposta(proposalId, userUsername) {
        try {
            await axios.patch(`${process.env.VCTex_baseURL}/service/proposal/cancel`,
                {
                    proposalId: proposalId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    }
                }
            )

            // recuperando o num do contrato para atualizar os dados no banco
            const proposalDB = await PropostasRepository.findOne(proposalId);
            const numContract = proposalDB.dataValues.numero_contrato;

            // precisa desse timeout por causa da latência do servidor deles
            await new Promise(resolve => setTimeout(resolve, 3000));
            await this.AtualizarRegistroPropostaDB(numContract, proposalId, userUsername);
        } catch (err) {
            if(axios.isAxiosError(err)) {
                const status = 424;
                const message = err.response?.data?.message || "Erro desconhecido.";

                throw new HttpException(message, status);
            }

            if(err instanceof HttpException) {
                throw new HttpException(err.message, err.status);
            }
        }
    }

    async VerificarTodasAsPropostas() {
        try {
            const propostas = await PropostasRepository.findAllParaVerificar();

            // for diferente para funcionar o await da funcao
            for (const { proposal_id, numero_contrato } of propostas) {
                await this.AtualizarRegistroPropostaDB(numero_contrato, proposal_id);

                // timeout para n explodir a API dos manos
                await new Promise(resolve => setTimeout(resolve, 5000));
            };

            // reagenda a task
            TaskScheduler.schedule("Verificar propostas do VCTex", () => this.VerificarTodasAsPropostas(), 1800000);
        } catch (err) {
            console.log(err);
            throw err
        }
    }

    async VerificarApenasUmaProposta(proposalId) {
        try {
            const proposal = await PropostasRepository.findOne(proposalId);
            const numero_contrato = proposal.dataValues.numero_contrato

            await this.AtualizarRegistroPropostaDB(numero_contrato, proposalId);
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


    // funcao interna (só usa aqui dentro desse service)
    async AtualizarRegistroPropostaDB(contractNumber, proposalId, username) {
        try {
            const STATUS_FINALIZADOS = new Set([
                70, 80, 130,
                1001, 1002, 1003, 1004, 1005, 1006,
                1007, 1008, 1009, 1010, 1011, 1012,
                1013, 1014, 1015, 1016, 1017, 1018,
                1019, 1020, 1022, 1023, 1024, 1025,
                1026, 1030
            ]);

            const contractNumberFormatado = contractNumber.replace(/\//g, '-');

            const { data } = await axios.get(`${process.env.VCTex_baseURL}/service/proposal/contract-number`,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'contract-number': contractNumberFormatado
                    }
                }
            );

            // tento recuperar apenas o proposalStatusId para lidar melhor com a coluna "Verificar"
            const responseProposalStatus = await axios.get(`${process.env.VCTex_baseURL}/service/proposal/status/${proposalId}`, 
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    }
                }
            )
            const verificar = !STATUS_FINALIZADOS.has(responseProposalStatus.data.proposalStatusId);

            const propostaAPI = data.data;
            const propostaDB = await PropostasRepository.findOne(proposalId);

            // mapeia so os dados vindos da API
            const dadosAtualizados = {
                nome: propostaAPI.borrower.name,
                cpf: propostaAPI.borrower.cpf,
                cel: propostaAPI.borrower.phoneNumber,
                data_nascimento: propostaAPI.borrower.birthdate,
                link_form:
                    propostaAPI.proposalStatusId === 60
                        ? propostaAPI.contractFormalizationLink
                        : null,
                valor_liquido: propostaAPI.financial.totalReleasedAmount,
                valor_seguro: propostaAPI.financial.contractInsuranceAmount,
                valor_emissao: propostaAPI.financial.totalAmount,
                numero_contrato: propostaAPI.proposalContractNumber,
                status_proposta: propostaAPI.proposalStatusDisplayTitle,
                msg_status: propostaAPI.proposalStatusReserveDisplayTitle,
                data_status: new Date(),
                verificar
            };

            // se nao existe, cria
            if (!propostaDB) {
                await PropostasRepository.create({
                    ...dadosAtualizados,
                    proposal_id: proposalId,
                    contrato: 'null',
                    usuario: username,
                    banco: 'VCTex'
                });

                return;
            }

            // se existe, atualiza
            await propostaDB.update(dadosAtualizados);

        } catch (err) {
            console.error('Erro ao atualizar proposta:', err);
            throw err;
        }
    }
    getToken() {
        return this.accessToken;
    }
}

export default new VCTexServices();