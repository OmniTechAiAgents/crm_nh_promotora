import { z } from 'zod';

export const ValidarBodyCancelarPropostaCLT = z
    .object({
        instituicao: z.enum(["Presenca bank", "v8"]),
        proposalId: z.string(),
        motivo: z.string().optional()
    })