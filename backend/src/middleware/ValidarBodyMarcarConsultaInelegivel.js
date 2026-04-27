import { z } from 'zod';

export const ValidarBodyMarcarConsultaInelegivel = z
    .object({
        id_consulta: z.number(),
        motivo: z.string()
    })