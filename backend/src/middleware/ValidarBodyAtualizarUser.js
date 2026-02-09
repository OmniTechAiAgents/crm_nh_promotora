import { z } from 'zod';

export const ValidarBodyAtualizarUser = z
    .object({
        username: z.string(),
        role: z.enum(["admin", "promotor"])
    })