class AuthModel {
    async criarUsuario(userData) {
        try {
            console.log(userData)
        } catch(err) {
            throw err;
        }
    }

}

export default AuthModel;