import { z } from 'zod';
import VerifyCpfMask from '../utils/VerifyCpfMask.js';

export const ValidarBodyPropostaCLT = z
    .object({
        instituicao: z.enum(["v8", "Nossa fintech"]),
        
        bankCode: z.string().optional().nullable(),
        accountType: z.enum(["corrente", "poupanca"]).optional().nullable(),
        accountNumber: z.string().optional().nullable(),
        accountDigit: z.string().optional().nullable(),
        branchNumber: z.string().optional().nullable(),

        pixKey: z.string().optional().nullable(),
        pixKeyType: z.enum(["chave_aleatoria", "email", "telefone", "cpf"]).optional().nullable(),

        cpf: z.string(),
        sexo: z.string().optional(),
        nomeMae: z.string().optional(),
        cnpjEmpregador: z.string().optional(), 
        registroEmpregaticio: z.string().optional(),

        qtdParcelas: z.number().int().optional(),
        valorParcelas: z.number().optional(),
        tabelaId: z.number().int().or(z.string()).optional(),

        simulacaoId: z.string().optional(),
        nomeTabela: z.string().optional(),
        taxaJurosMensal: z.number().optional(),
        valorSolicitado: z.number().optional(),
        valorLiberado: z.number().optional(),

        // --- ESPECÍFICOS: Nossa fintech ---
        banco: z.string().optional(),
        cnpj_empregador: z.string().optional(),
        profissao: z.string().optional(),
        valor_parcelas: z.number().optional(),
        taxa_aplicada: z.number().optional()
    })
    .superRefine((data, ctx) => {
        const recebeBanco = data.bankCode || data.accountType || data.accountNumber || data.accountDigit || data.branchNumber;
        const recebePix = data.pixKey || data.pixKeyType;

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

        if (data.instituicao === "Nossa fintech") {
            const requiredForNossaFintech = [
                { field: 'simulacaoId', value: data.simulacaoId },
                { field: 'banco', value: data.banco },
                { field: 'cnpj_empregador', value: data.cnpj_empregador },
                { field: 'profissao', value: data.profissao },
                { field: 'valor_parcelas', value: data.valor_parcelas },
                { field: 'taxa_aplicada', value: data.taxa_aplicada }
            ];

            requiredForNossaFintech.forEach(req => {
                if (req.value === undefined || req.value === null) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `O campo ${req.field} é obrigatório quando a instituição for Nossa fintech`,
                        path: [req.field] // Isso aponta o erro diretamente pro campo no frontend
                    });
                }
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
            
            switch (data.pixKeyType) {
                case "chave_aleatoria":
                    data.pixKeyType = "chave aleatória";
                    break;
                case "email":
                    data.pixKeyType = "email";
                    break;
                case "telefone":
                    data.pixKeyType = "telefone";
                    break;
                case "cpf":
                    data.pixKeyType = "cpf";
                    break;
                default:
                    break;
            }
        } else if (recebeBanco) {
            data.pixKey = null;
            data.pixKeyType = null;
        }

        return data;
    });