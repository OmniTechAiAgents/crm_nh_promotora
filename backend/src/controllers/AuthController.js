import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import AuthModel from '../models/AuthModel.js';

class AuthController {
    async Registro (req, res) {
        try {
            const { username, password, role } = req.body;
            const passwordHashed = await bcrypt.hash(password, 10);

            // adiciona usuario no DB

            // gera o token e retorna no msg

            return res.status(200).json({ msg: "funfou" })
        } catch (err) {
            console.error(`Erro ao registrar o usuario: ${err}`);
            return res.status(500).json({ erro: "Erro ao registrar." })
        }
    }
}

export default new AuthController();