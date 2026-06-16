import { z } from 'zod';
import VerifyCpfMask from '../utils/VerifyCpfMask.js';

export const ValidarBodyAuthDataPrevCLT = z
    .object({
        cpf: z.string(),
        instituicao: z.enum(["v8", "Nossa fintech"]),
        banco: z.string()
    })
    .superRefine((data, ctx) => {
        if (!data.cpf || VerifyCpfMask(data.cpf)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'CPF inválido. Envie apenas números.'
            });
        }
    })
