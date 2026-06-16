import api from "../api/client";

export const criarPropostaCLT = async(body) => {
    const { data } = await api.post("/propostas/CLT", body);
    return data;
};