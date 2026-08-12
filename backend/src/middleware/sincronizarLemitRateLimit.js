import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redisClient.js';

export const SincronizarLemitRateLimit = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // equivalente a 1 dia
    max: 100,

    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args.flat()),
        prefix: "rl:lemit:",
    }),

    keyGenerator: (req) => {
        return `promotor:${req.user?.id}`
    },

    // desativa a regra para admin, aplicando só para promotor
    skip: (req) => {
        return req.user?.role === "admin";
    },

    // oq retornar se estourar o limite
    handler: (req, res) => {
        return res.status(429).json({
            error: "Limite diário atingido",
            message: "Contate um administrador para continuar a fazer as consultas"
        });
    },

    standardHeaders: true,
    legacyHeaders: false
});