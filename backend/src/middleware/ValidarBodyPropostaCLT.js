import { z } from 'zod';
import VerifyCpfMask from '../utils/VerifyCpfMask.js';

export const ValidarBodyPropostaCLT = z
    .object({
        // informações que o usuário vai ter q digitar
        instituicao: z.enum(["Presenca bank", "v8"]),
        bankCode: z.string().optional(),
        accountType: z.enum([
            "corrente", 
            "poupanca"
            ]).optional(),
            pixKey: z.string().optional(),
        pixKeyType: z.enum([
            "chave_aleatoria", 
            "email", 
            "telefone", 
            "cpf"
        ]).optional(),
        accountNumber: z.string().optional(),
        accountDigit: z.string().optional(),
        branchNumber: z.string().optional(),

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
        const recebePix = data.pixKey || data.pixKeyType;

        if (data.instituicao == "Presenca bank" && recebePix) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "A instiuição 'Presenca bank' não suporta operações com pix."
            })
        }

        if (!data.cpf || VerifyCpfMask(data.cpf)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'CPF inválido. Envie apenas números.'
            });
        }
    })
    .transform((data) => {
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
                    data.pixKeyType = "phone"
                    break;
                case "cpf":
                    data.pixKeyType = "cpf"
                    break;
                default:
                    break;
            }
        }

        return data;
    })
  