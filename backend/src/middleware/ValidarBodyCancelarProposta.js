import { z } from 'zod';

export const ValidarBodyCancelarProposta = z
    .object({
        proposalId: z.string()
    })
    .superRefine((data, ctx) => {
        if (!data.proposalId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'O campo "proposalId" é necessário.'
            });
        }
    })