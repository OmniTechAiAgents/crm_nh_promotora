import { z } from 'zod';
import VerifyCpfMask from '../utils/VerifyCpfMask.js';

export const ValidarBodyPropostaCLT = z
    .object({
        // informações que o usuário vai ter q digitar
        instituicao: z.enum(["Presenca bank", "v8"]),
        
        // nullable serve para o transform poder mudar para null sem dar merda
        bankCode: z.string().optional().nullable(),
        accountType: z.enum(["corrente", "poupanca"]).optional().nullable(),
        accountNumber: z.string().optional().nullable(),
        accountDigit: z.string().optional().nullable(),
        branchNumber: z.string().optional().nullable(),

        pixKey: z.string().optional().nullable(),
        pixKeyType: z.enum(["chave_aleatoria", "email", "telefone", "cpf"]).optional().nullable(),

        // informações sobre a proposta vinda dos end-points anteriores
        cpf: z.string(),
        sexo: z.string(),
        nomeMae: z.string().optional(),
        cnpjEmpregador: z.string().optional(),
        registroEmpregaticio: z.string().optional(),

        qtdParcelas: z.number().int(),
        valorParcelas: z.number(),
        tabelaId: z.number().int().or(z.string()),

        // informações que são necessárias para o v8 funcionar
        simulacaoId: z.string().optional(),
        nomeTabela: z.string().optional(),
        taxaJurosMensal: z.number().optional(),
        valorSolicitado: z.number().optional(),
        valorLiberado: z.number().optional()
    })
    .superRefine((data, ctx) => {
        const recebeBanco = data.bankCode || data.accountType || data.accountNumber || data.accountDigit || data.branchNumber;
        const recebePix = data.pixKey || data.pixKeyType;

        if (data.instituicao == "Presenca bank" && recebePix) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "A instituição 'Presenca bank' não suporta operações com pix. Envie apenas dados bancários."
            });
        }

        if (recebeBanco && recebePix) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Não é permitido enviar dados bancários e Pix juntos'
            });
            return;
        }

        if (recebeBanco) {
            if (!data.bankCode || !data.accountNumber || !data.accountDigit || !data.branchNumber) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'bankCode, accountNumber, accountDigit e branchNumber são obrigatórios'
                });
            }
        }

        if (recebePix) {
            if (!data.pixKey || !data.pixKeyType) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'pixKey e pixKeyType são obrigatórios'
                });
            }
        }

        if (!recebeBanco && !recebePix) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'É necessário o envio da chave pix ou dos dados bancários'
            });
        }

        if (!data.cpf || VerifyCpfMask(data.cpf)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'CPF inválido. Envie apenas números.'
            });
        }
    })
    .transform((data) => {
        const recebeBanco = data.bankCode || data.accountType || data.accountNumber || data.accountDigit || data.branchNumber;
        const recebePix = data.pixKey || data.pixKeyType;

        if (recebePix) {
            data.bankCode = null;
            data.accountType = null;
            data.accountNumber = null;
            data.accountDigit = null;
            data.branchNumber = null;
        } else if (recebeBanco) {
            data.pixKey = null;
            data.pixKeyType = null;
        }

        if (data.instituicao == "Presenca bank") {
            switch (data.accountType) {
                case "corrente":
                    data.accountType = "2"
                    break;
                case "poupanca":
                    data.accountType = "1"
                    break;
                default:
                    break
            }
        }

        if (data.instituicao == "v8") {
            switch (data.pixKeyType) {
                case "chave_aleatoria":
                    data.pixKeyType = "chave aleatória"
                    break;
                case "email":
                    data.pixKeyType = "email"
                    break;
                case "telefone":
                    data.pixKeyType = "telefone"
                    break;
                case "cpf":
                    data.pixKeyType = "cpf"
                    break;
                default:
                    break;
            }
        }

        return data;
    });