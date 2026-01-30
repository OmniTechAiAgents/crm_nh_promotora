import ISPB_consulta from "../models/ISPB_consulta.js";

class ISPBRepository {
    async findByCod(num_cod) {
        return ISPB_consulta.findOne({
            where: {num_cod},
            raw: true
        })
    }
}

export default new ISPBRepository();