import jwt from "jsonwebtoken";

export function AuthenticationToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // deixa as infos do usuario que foram extraidas do token no "req" da resposta (vai ser usado no authorized roles)
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}
