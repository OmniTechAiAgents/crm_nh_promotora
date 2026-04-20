import { z } from 'zod';

// Schema para os itens individuais do array
const EdicaoItemSchema = z.object({
    id: z.number().int().positive({ message: "ID deve ser um número inteiro positivo" }),
    usuario_id: z.number().int().positive({ message: "usuario_id deve ser um número inteiro positivo" })
});

// Schema principal que valida o Array
export const validarBodyAtribuirConsultasCLTPython = z.array(EdicaoItemSchema).nonempty("O array de edições não pode estar vazio");