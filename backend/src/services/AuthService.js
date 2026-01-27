import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import AuthRepository from '../repositories/AuthRepository.js';
import HttpException from '../utils/HttpException.js';

class AuthService {
    async Registro({ username, password, role }) {
        if (role !== undefined && role !== "admin" && role !== "promotor") {
            throw new HttpException("Essa role não existe.", 400);
        }
        
        // verifica se ja nao existe um usuario com o mesmo nome
        const userExistente = await AuthRepository.findOneByUsername(username);
        if (userExistente) {
            throw new HttpException("Ja existe um usuario esse username", 409)
        };

        const passwordHashed = await bcrypt.hash(password, 10);

        // adiciona usuario no DB
        await AuthRepository.create({
            username: username,
            password: passwordHashed,
            role: role
        });
    }

    async Login ({ username, password }) {
        const user = await AuthRepository.findOneByUsername(username);
        if (!user) {
            throw new HttpException("Credenciais invalidas", 401);
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new HttpException("Credenciais invalidas", 401);
        }

        // facilitar para o front
        const adminPermissions = [
            "FGTS_VIEW",
            "FGTS_EXPORT",
            "USER_MANAGE"
        ]

        const promotorPermissions = [
            "FGTS_VIEW",
            "FGTS_EXPORT",
        ]

        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role,
                username: user.username 
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN 
            }
        );

        return {
            token,
            user: {
                id: user.id,
                name: user.username,
                roles: [user.role],
                permissions: user.role == "admin" ? adminPermissions : promotorPermissions
            }
        };
    }
}

export default new AuthService();