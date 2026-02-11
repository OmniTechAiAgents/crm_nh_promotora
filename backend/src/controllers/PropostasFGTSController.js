import { ValidarBodyProposta } from "../middleware/ValidarBodyProposta.js";
import HttpException from "../utils/HttpException.js";
import { ZodError } from "zod";
import PropostasFGTSService from "../services/PropostasFGTSService.js";
import { ValidarBodyCancelarProposta } from "../middleware/ValidarBodyCancelarProposta.js";

class PropostasFGTSController {
    async FazerProposta (req, res) {
        try {
            const dados = ValidarBodyProposta.parse(req.body)
            const { financialId } = req.query;
            
            const objProposta = {
                cpf: dados.cpf,
                financialId: financialId,
                instituicao: dados.instituicao,
                bankCode: dados.bankCode ?? null,
                accountType: dados.accountType ?? null,
                accountNumber: dados.accountNumber ?? null,
                accountDigit: dados.accountDigit ?? null,
                branchNumber: dados.branchNumber ?? null,
                pixKey: dados.pixKey ?? null,
                pixKeyType: dados.pixKeyType ?? null
            };

            await PropostasFGTSService.FazerProposta(objProposta, req.user);

            return res.status(200).json({ msg: "Proposta criada com sucesso e já armazenada no banco de dados." });
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    erro: err.issues[0].message
                });
            }

            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            return res.status(500).json({ erro: err.message });
        }
    }

    async RecuperarPropostas (req, res) {
        try {
            // tenta recuperar page e limit do req, se nao seta valores padroes para 1 e 10;
            const pesquisa = req.query.pesquisa;
            const page = parseInt(req.query.pagina) || 1;
            const limit = parseInt(req.query.limite) || 10;

            const response = await PropostasFGTSService.RecuperarPropostas(pesquisa, page, limit, req.user);

            if (!response.data || response.data.length == 0) {
                return res.status(204).send();
            }

            return res.status(200).json( response );
        } catch (err) {
            console.log(err)

            if (err instanceof ZodError) {
                return res.status(400).json({
                    erro: err.issues[0].message
                });
            }

            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            return res.status(500).json({ erro: err.message });
        }
    }

    async CancelarProposta (req, res) {
        try {
            const dados = ValidarBodyCancelarProposta.parse(req.body)

            const response = await PropostasFGTSService.CancelarProposta(dados.proposalId, req.user);

            return res.status(200).json( response );
        } catch (err) {
            console.log(err);
            if (err instanceof ZodError) {
                return res.status(400).json({
                    erro: err.issues[0].message
                });
            }

            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            return res.status(500).json({ erro: err.message });
        }
    }

    async VerificarProposta (req, res) {
        try {
            const dados = ValidarBodyCancelarProposta.parse(req.body);

            const response = await PropostasFGTSService.VerificarProposta(dados.proposalId);

            return res.status(200).json( response );
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    erro: err.issues[0].message
                });
            }

            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            return res.status(500).json({ erro: err.message });
        }
    }
}

export default new PropostasFGTSController();