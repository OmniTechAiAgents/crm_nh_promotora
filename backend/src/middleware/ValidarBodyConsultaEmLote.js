import { z } from 'zod';

export const ValidarBodyConsultaEmLote = z
    .object({
        id_promotor: z.coerce.number().int().positive(),
        instituicao: z.enum(["VCTex", "Nossa fintech"])
    })