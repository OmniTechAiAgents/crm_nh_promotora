export function AuthorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    // recupera as informacoes do user no "req" (vem do authorization)
    const { role } = req.user;

    console.log(role);
    console.log(`...\n ${allowedRoles}`)

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        error: "Você não tem permissão para acessar este recurso.",
      });
    }

    return next();
  };
}
