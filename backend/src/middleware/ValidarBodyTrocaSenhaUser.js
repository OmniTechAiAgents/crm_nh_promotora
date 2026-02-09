import { z } from 'zod';

export const ValidarBodyTrocaSenhaUser = z
    .object({
        password: z.string()
    })