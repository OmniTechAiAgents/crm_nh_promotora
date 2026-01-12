

class ConsultasFGTSController {
    async FazerConsulta (req, res) {
        try {
            const { instituicao, cpf, anuidades, saldo, tabela, usuario, chave, banco } = req.body;
            // instituicao = VCtex, Nossa Fintech....

            const objTeste = {
                instituicao, 
                cpf, 
                anuidades, 
                saldo, 
                tabela, 
                usuario, 
                chave, 
                banco
            }
            
            console.table(objTeste);

            return res.status(200).json({ msg: "dados recebidos com sucesso" });
        } catch (err) {
            return res.status(500).json({ erro: err.message });
        }
    }
}

export default new ConsultasFGTSController();