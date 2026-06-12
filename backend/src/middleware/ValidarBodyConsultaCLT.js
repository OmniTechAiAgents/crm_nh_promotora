import { z } from 'zod';
import VerifyCpfMask from '../utils/VerifyCpfMask.js';

export const ValidarBodyConsultaCLT = z
    .object({
        cpf: z.string(),

        instituicao: z.enum(["v8", "Nossa fintech"]),

        banco: z.string().optional()
    })
    .superRefine((data, ctx) => {
        if (!data.cpf || VerifyCpfMask(data.cpf)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'CPF inválido. Envie apenas números.'
            });
        }

        if (data.instituicao === "Nossa fintech" && !data.banco) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['banco'],
                message: 'Banco é obrigatório para Nossa fintech'
            });
        }
    })