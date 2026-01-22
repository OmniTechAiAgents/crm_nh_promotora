import { z } from 'zod';
import VerifyCpfMask from '../utils/VerifyCpfMask.js';

export const ValidarBodyConsulta = z
    .object({
        cpf: z.string(),

        instituicao: z.enum(["VCTex", "Parana"]).optional()
    })
    .superRefine((data, ctx) => {
        if (!data.cpf || VerifyCpfMask(data.cpf)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'CPF inválido. Envie apenas números.'
            });
        }
    })