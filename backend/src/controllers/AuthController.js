import HttpException from '../utils/HttpException.js';
import AuthService from '../services/AuthService.js';

class AuthController {
    async Registro (req, res) {
        try {
            const { username, password, role } = req.body;

            await AuthService.Registro({ username, password, role });

            return res.status(201).json({ msg: "O usuario foi criado com sucesso, e a conta já pode ser acessada." });
        } catch (err) {
            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            console.error(`Erro ao registrar o usuario: ${err}`);
            return res.status(500).json({ erro: err.message });
        }
    }

    async Login (req, res) {
        try {
            const { username, password } = req.body;

            const token = await AuthService.Login({ username, password });

            return res.status(200).json({ token: token });
        } catch (err) {
            if (err instanceof HttpException) {
                return res.status(err.status).json({ erro: err.message });
            }

            console.error(`Erro ao realizar o login do usuario ${err.message}`);
            return res.status(500).json({ erro: "Erro ao realizar o login" });
        }
    }
}

export default new AuthController();