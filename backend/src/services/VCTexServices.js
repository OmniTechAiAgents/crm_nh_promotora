import axios from 'axios';
import TokenAPIsRepository from '../repositories/TokenAPIsRepository.js';

class VCTexServices {
    async Autenticar() {
        try {
            const retorno = await TokenAPIsRepository.findOneByNameAndType("vctex", "fgts");
            
            // LEMBRAR: tirar o ! de !retorno para funcionar direito
            if (!retorno) {
                // 1 - Verifica o tempo de vida do token;

                // 2 - Agenda a tarefa para refazer a autenticacao com base no tempo restante;
                
                // 3 - Retorna o token que ainda e valido (retorno.access_token) q vem do banco de dados;
                return "teste";
            }

            const response = await axios.post(`${process.env.VCTex_baseURL}/authentication/login`, {
                cpf: process.env.VCTEX_user,
                password: process.env.VCTEX_password
            });

            console.log(response);

            console.log("API da VCTex conectada.")
            return response.token.access-token;
        } catch(err) {
            console.error(`
                Não foi possivel recuperar o token de acesso da VCTex:
                
                Código de resposta: ${err.response.status || null};
                Mensagem: ${err.response.data.message || null};
            `);
        }
    }
}

export default new VCTexServices();