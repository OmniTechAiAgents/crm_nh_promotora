import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import AuthRepository from '../repositories/AuthRepository.js';
import HttpException from '../utils/HttpException.js';

class AuthController {
    async Registro (req, res) {
        try {
            const { username, password, role } = req.body;
            const passwordHashed = await bcrypt.hash(password, 10);

            if (role !== undefined && role !== "admin" && role !== "promotor") {
                throw new HttpException("Essa role não existe.", 400);
            }

            // verifica se ja nao existe um usuario com o mesmo nome
            const userExistente = await AuthRepository.findOneByUsername(username);
            if (userExistente) {
                throw new HttpException("Ja existe um usuario esse username", 409)
            };

            // adiciona usuario no DB
            await AuthRepository.create({
                username: username,
                password: passwordHashed,
                role: role
            });

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

            const user = await AuthRepository.findOneByUsername(username);
            if (!user) {
                throw new HttpException("Credenciais invalidas", 401);
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                throw new HttpException("Credenciais invalidas", 401);
            }

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

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