import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

export const authenticationToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];
    if (!token || token == "") return res.status(401).json({ error: "O token de autenticacao não foi fornecido." });

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.status(403).json({ error: "O token fornecido está errado ou é inválido." });

        req.user = user;
        next();
    });
};