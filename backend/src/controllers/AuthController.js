// imports

class AuthController {
    async TestResponse(req, res) {
        return res.status(200).json({ msg: "End-point funcionando..." })
    }
}

module.exports = new AuthController();