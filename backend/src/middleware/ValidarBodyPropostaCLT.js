import { z } from 'zod';
import VerifyCpfMask from '../utils/VerifyCpfMask.js';

export const ValidarBodyPropostaCLT = z
    .object({
        // informações que o usuário vai ter q digitar
        instituicao: z.enum(["Presenca bank"]),
        bankCode: z.string(),
        accountType: z.enum([
            "corrente", 
            "poupanca"
            ]),
        accountNumber: z.string(),
        accountDigit: z.string(),
        branchNumber: z.string(),

        // informações sobre a proposta vinda dos end-points anteriores
        cpf: z.string(),
        sexo: z.string(),
        nomeMae: z.string(),
        cnpjEmpregador: z.string(),
        registroEmpregaticio: z.string(),

        qtdParcelas: z.number().int(),
        valorParcelas: z.number(),
        tabelaId: z.number().int()
    })
    .superRefine((data, ctx) => {
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

        return data;
    })
  