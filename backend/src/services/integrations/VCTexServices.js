import axios from 'axios';
import TokenAPIsRepository from '../../repositories/TokenAPIsRepository.js';
import IsTokenExpired from '../../utils/IsTokenExpired.js';
import TaskScheduler from '../../utils/TaskScheduler.js';
import HttpException from '../../utils/HttpException.js';
import ConsultasFGTSRepository from '../../repositories/ConsultasFGTSRepository.js';
import SimulateFGTS from '../../utils/SimulateFGTS.js';
import ClientesService from '../ClientesService.js';
import SearchByCEP from '../../utils/SearchByCEP.js';

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
                { code: "CDC", enabled: true },
                { code: "QITECH", enabled: true },
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

            await ConsultasFGTSRepository.Create(response);
        } catch (err) {
            let status = 500;
            let message = "Erro inesperado ao realizar a simulação";

            if (axios.isAxiosError(err)) {
                status = err.response?.data?.statusCode ?? 500;
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
            const verifica = await ConsultasFGTSRepository.SearchByFinancialId(data.financialId);
            if (!verifica) {
                throw new HttpException("Nenhuma proposta encontrada com esse financialId", 404);
            }

            const cliente = await ClientesService.procurarCpf(data.cpf);

            const enderecoInfos = await SearchByCEP(cliente.dataValues.cep)

            const reqBody = ({
                feeScheduleId: 0,
                financialId: data.financialId,
                borrower: {
                    name: cliente.dataValues.nome,
                    cpf: cliente.dataValues.cpf,
                    birthdate: cliente.dataValues.data_nasc,
                    gender: cliente.dataValues.sexo == "M" ? "male" : cliente.dataValues.sexo == "F" ? "female" : "other",
                    phoneNumber: "11999999999",
                    email: "exemple@gmail.com",
                    maritalStatus: "single",
                    nationality: "brazilian",
                    naturalness: "brazilian",
                    motherName: cliente.dataValues.nome_mae,
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
                    zipCode: cliente.dataValues.cep,
                    street: enderecoInfos.data.logradouro,
                    number: 1,
                    complement: null,
                    neighborhood: enderecoInfos.data.bairro,
                    city: enderecoInfos.data.localidade,
                    state: enderecoInfos.data.uf
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

            console.log("Tentando enviar body de proposta para VCTex...");
            const response = await axios.post(`${process.env.VCTex_baseURL}/service/proposal`, 
                reqBody,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // rodar logica para armazenar o body de retorno da proposta no banco de dados
            console.log(response.data);
            return true;
        } catch (err) {
            if(axios.isAxiosError(err)) {
                const status = err.response?.data?.statusCode || 500;
                const message = err.response?.data?.message || "Erro desconhecido.";

                throw new HttpException(message, status);
            }

            if(err instanceof HttpException) {
                throw new HttpException(err.message, err.status);
            }

            throw new HttpException(err.message, 500);
        }
    }

    getToken() {
        return this.accessToken;
    }
}

export default new VCTexServices();