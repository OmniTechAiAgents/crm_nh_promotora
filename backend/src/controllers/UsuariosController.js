import HttpException from '../utils/HttpException.js';
import AuthService from '../services/AuthService.js';
import { ZodError } from "zod";
import { ValidarBodyAtualizarUser } from '../middleware/ValidarBodyAtualizarUser.js';
import { ValidarBodyTrocaSenhaUser } from '../middleware/ValidarBodyTrocaSenhaUser.js';

class UsuariosController {
    async Buscar (req, res) {
        try {
            const pesquisa = req.query.pesquisa;
            const page = parseInt(req.query.pagina) || 1;
            const limit = parseInt(req.query.limite) || 10;

            const responseRaw = await AuthService.BuscarUsuarios(pesquisa, page, limit);

            // mapeando retorno (espécie de enum)
            const response = {
                data: responseRaw.data.map(user => ({
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                })),
                totalPages: responseRaw.totalPages
            };

            if (!response.data || response.data.length == 0) {
                return res.status(204).send();
            }

            return res.status(200).json(response);
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    erro: err.issues[0].message
                });
            }

            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            console.error(`Erro ao deletar o usuario: ${err}`);
            return res.status(500).json({ erro: err.message });
        }
    }

    async Atualizar (req, res) {
        try {
            const dados = ValidarBodyAtualizarUser.parse(req.body);
            const { usuarioId } = req.params;

            const bodyRequest = ({
                username: dados.username,
                role: dados.role
            });

            await AuthService.AtualizarUsuario(usuarioId, bodyRequest);

            return res.status(200).json({ msg: "Dados do usuário atualizado com sucesso." });
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    erro: err.issues[0].message
                });
            }

            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            console.error(`Erro ao deletar o usuario: ${err}`);
            return res.status(500).json({ erro: err.message });
        }
    }

    async MudarSenha (req, res) {
        try {
            const dados = ValidarBodyTrocaSenhaUser.parse(req.body);
            const { usuarioId } = req.params;

            await AuthService.MudarSenha(usuarioId, dados.password);

            return res.status(200).json({ msg: "A senha do usuário foi alterada com sucesso." })
        } catch(err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    erro: err.issues[0].message
                });
            }

            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            console.error(`Erro ao trocar a senha do usuario: ${err}`);
            return res.status(500).json({ erro: err.message });
        }
    }

    async Deletar (req, res) {
        try {
            const { usuarioId } = req.params;

            await AuthService.DeletarUsuario(usuarioId);

            return res.status(200).json({ msg: "Usuário deletado com sucesso." });
        } catch (err) {
            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            console.error(`Erro ao deletar o usuario: ${err}`);
            return res.status(500).json({ erro: err.message });
        }
    }
}

export default new UsuariosController();