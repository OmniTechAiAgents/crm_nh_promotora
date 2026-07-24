import axios from 'axios';
import HttpException from '../../utils/HttpException.js';

class LemitService {
    async BuscarDados(cpf) {
        try {
            console.log("Iniciando request no lemit");

            const response = await axios.post(`${process.env.Lemit_baseURL}/consulta/pessoa`, 
                {
                    documento: cpf
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.Lemit_API_key}`,
                    }
                }
            )

            return response.data;
        } catch(err) {
            console.log("Log exception LemitService:");
            // erros podem vir em formatos diferentes do Lemit
            const rawErrors = err.response?.data?.errors;
            console.log(rawErrors);

            if(axios.isAxiosError(err)) {
                const status = 424;

                // trata o erros tentando puxar como "coringa", msm q estiver dentro de array o obj
                const getFirstErrorMessage = (errors) => {
                    if (!errors) return null;
                    if (typeof errors === 'string') return errors;
                    if (Array.isArray(errors)) return errors[0];
                    if (typeof errors === 'object') {
                        const firstValue = Object.values(errors)[0];
                        if (Array.isArray(firstValue)) return firstValue[0];
                        if (typeof firstValue === 'string') return firstValue;
                    }
                    return null;
                };

                // deixando explícito a msg de quando o lemit não encontra o cpf do cliente
                let message = getFirstErrorMessage(rawErrors) || err.response?.data?.message || "Erro desconhecido.";
                if (message === "Not found.") {
                    message = "Esse CPF não foi encontrado na base de dados do Lemit";
                }

                throw new HttpException(message, status);
            }

            throw new HttpException(err.message, 500);
        }
    }
}

export default new LemitService();