import { z } from 'zod';

export const ValidarBodyCliente =
    z.object({
        cpf: z.string(),
        nome: z.string(),
        data_nasc: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
        celular: z.string()
    })