import { z } from 'zod';

export const ValidarBodyReatribuicaoConsultaLote = z
    .object({
        id_consulta_lote: z.coerce.number().int().positive(),
        id_novo_promotor: z.coerce.number().int().positive()
    })