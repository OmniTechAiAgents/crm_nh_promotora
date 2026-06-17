import { z } from "zod";

export const ValidarBodySimulacaoCLT = z
    .object({
        idTermo: z.string().optional(),
        cnpj_empregador: z.string().optional(),
        banco: z.string().optional(),
        tabelaId: z.string().optional(),
        instituicao: z.enum(["v8", "Nossa fintech"]),
        valorParcelas: z.number(),
        qtdParcelas: z.number().optional(),
    })