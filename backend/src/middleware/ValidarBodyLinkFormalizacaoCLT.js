import { z } from 'zod';
import VerifyCpfMask from '../utils/VerifyCpfMask.js';

export const ValidarBodyLinkFormalizacaoCLT = z
    .object({
        instituicao: z.enum(["c6"]),
        cpf: z.string(),
    })
    .superRefine((data, ctx) => {
        if (!data.cpf || VerifyCpfMask(data.cpf)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'CPF inválido. Envie apenas números.'
            });
        }
    })