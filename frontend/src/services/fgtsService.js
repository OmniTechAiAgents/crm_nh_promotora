import api from "../api/client";

export const criarPropostaFGTS = async (financialId, body) => {
  return await api.post("/propostas/fgts", body, {
    params: { financialId },
  });
};

export const cancelarPropostaFGTS = async (proposalId) => {
  return await api.patch("/propostas/FGTS/cancelar", {
    proposalId,
  });
};