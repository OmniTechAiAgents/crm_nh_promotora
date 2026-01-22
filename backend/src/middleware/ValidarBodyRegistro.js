import { z } from 'zod';

export const ValidarBodyRegistro = z
    .object({
        username: z.string(),
        password: z.string(),
        role: z.enum(["admin", "promotor"]).optional()
    })