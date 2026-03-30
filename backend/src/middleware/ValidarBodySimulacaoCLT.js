import { z } from "zod";

export const ValidarBodySimulacaoCLT = z
    .object({
        idTermo: z.string().optional(),
        tabelaId: z.string().optional(),
        instituicao: z.enum(["v8"]),
        valorParcelas: z.number(),
        qtdParcelas: z.number()
    })