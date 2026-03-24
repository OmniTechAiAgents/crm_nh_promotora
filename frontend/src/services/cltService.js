import api from "../api/client";

export const criarPropostaCLT = async(body) => {
    return await api.post("/propostas/CLT", body);
};