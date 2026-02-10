import { z } from 'zod';
import VerifyCpfMask from '../utils/VerifyCpfMask.js';

export const ValidarBodyProposta = z
  .object({
    cpf: z.string(),

    instituicao: z.enum(["VCTex", "Parana", "Nossa fintech"]),
    bankCode: z.string().optional(),
    accountType: z.enum([
      "corrente", 
      "poupanca",
      "pagamento"
    ]).optional(),
    accountNumber: z.string().optional(),
    accountDigit: z.string().optional(),
    branchNumber: z.string().optional(),

    pixKey: z.string().optional(),
    pixKeyType: z.enum([
      "CHAVE_ALEATORIA", 
      "EMAIL", 
      "TELEFONE", 
      "CPF", 
      "email", 
      "cpf",
      "phone",
      "random"
    ]).optional()
  })
  .superRefine((data, ctx) => {
    const recebeBanco = data.bankCode || data.accountType || data.accountNumber || data.accountDigit || data.branchNumber;
    const recebePix = data.pixKey || data.pixKeyType;

    if (data.instituicao === "VCTex" && data.accountType === "pagamento") {
      ctx.addIssue({
        path: ["accountType"],
        code: z.ZodIssueCode.custom,
        message: "A instituição VCTex não suporta conta do tipo pagamento"
      });
    }

    // verifica a integridade das informações de conta e pix
    if (recebeBanco && recebePix) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Não é permitido enviar dados bancários e Pix juntos'
      });
      return;
    }
    if (!data.cpf || VerifyCpfMask(data.cpf)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CPF inválido. Envie apenas números.'
      });
    }
    if (recebeBanco) {
      if (!data.bankCode || !data.accountType || !data.accountNumber || !data.accountDigit | !data.branchNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'bankCode, accountType, accountNumber, accountDigit e branchNumber são obrigatórios'
        });
      }
    }
    if (recebePix) {
      if (!data.pixKey || !data.pixKeyType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'pixKey e pixKeyType são obrigatórios'
        });
      }
    }
    if (!recebeBanco && !recebePix) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'É necessário o envio da chave pix ou dos dados bancários'
      });
    }
  })
  .transform((data) => {
    if (data.instituicao == "Nossa fintech") {
      switch (data.accountType) {
        case "corrente":
          data.accountType = "checking_account"
          break;
        case "poupanca":
          data.accountType = "saving_account"
          break;
        case "pagamento":
          data.accountType = "payment_account"
          break;
        default:
          break
      }
    }

    if (data.instituicao == "VCTex") {
      switch (data.accountType) {
        case "corrente":
          data.accountType = "corrente"
          break;
        case "poupanca":
          data.accountType = "poupanca"
          break;
        case "pagamento":
          data.accountType = "DEU ERRO"
          break;
        default:
          break
      }
    }
    return data;
  })
