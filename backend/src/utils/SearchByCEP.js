import axios from 'axios';

async function SearchByCEP (cep) {
    try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

        return response;    
    } catch (err) {
        console.log(err)
        throw err;
    }
}

export default SearchByCEP;