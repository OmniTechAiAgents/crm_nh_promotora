import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

class AuthController {
    async Registro (req, res) {
        try {
            // precisa adicionar a role tbm
            const { username, password, role } = req.body;

            const passwordHashed = await bcrypt.hash(password, 10);

            console.warn(`Adicionando as credenciais no DB: ${username}, ${passwordHashed}, ${role}`)

            return res.status(200).json({ msg: "funfou" })
        } catch (err) {
            console.error(`Erro ao registrar o usuario: ${err}`);
            return res.status(500).json({ erro: "Erro ao registrar." })
        }
    }
}

export default new AuthController();