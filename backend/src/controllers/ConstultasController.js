

class ConsultasController {
    async FazerConsulta (req, res) {
        try {
            const { tipo, instituicao, cpf, anuidades, saldo, tabela, usuario, chave, banco } = req.body;
            // tipo = FGTS ou CLT
            // instituicao = VCtex, Nossa Fintech....

            const objTeste = {
                tipo, 
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

export default new ConsultasController();