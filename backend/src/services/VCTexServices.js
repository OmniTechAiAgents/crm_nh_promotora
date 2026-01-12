import axios from 'axios';

class VCTexServices {
    async Autenticar() {
        try {
            const response = await axios.post(`${process.env.VCTex_baseURL}/authentication/login`, {
                cpf: process.env.VCTEX_user,
                password: process.env.VCTEX_password
            });

            console.log(response);

            return response.token.access-token;
        } catch(err) {
            console.error(`
                Não foi possivel recuperar o token de acesso da VCTex:
                
                Código de resposta: ${err.response.status};
                Mensagem: ${err.response.data.message};
            `);
        }
    }
}

export default new VCTexServices();