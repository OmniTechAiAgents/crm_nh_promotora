export function AuthenticateApiKey(req, res, next) {
    const apiToken = req.headers['apikey'];

    if (!apiToken) {
        return res.status(401).json({ erro: "ApiKey não fornecido." });
    }

    if (apiToken !== process.env.TOKEN_MS) {
        return res.status(403).json({ erro: "Você não tem permissão para essa ação." })
    }

    return next();
}