import { z } from 'zod';
import VerifyCpfMask from '../utils/VerifyCpfMask.js';

// Schema para os itens do array
const ConsultaItemSchema = z.object({
    cpf: z.string().refine((val) => !VerifyCpfMask(val), {
        message: 'CPF inválido. Envie apenas números.'
    }),
    nome: z.string().min(3),
    data_nasc: z.string(),
    celular: z.string(),
    valor_parcela: z.number().positive(),
    valor_solicitado: z.number().positive(),
    qtd_parcelas: z.number().int().positive(),
    cnpj: z.string(),
    empresa: z.string()
});

// Schema principal do Body
export const ValidarBodyConsultasCLTPython = z.object({
    // Aceita qualquer string, mas a chave é obrigatória
    instituicao: z.string().min(1, "Instituição é obrigatória"),
    
    // Validando o array de objetos
    consultas: z.array(ConsultaItemSchema).nonempty("O array de consultas não pode estar vazio")
});