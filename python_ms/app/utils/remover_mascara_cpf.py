import re

def remover_mascara_cpf(cpf) -> str:
    if not cpf:
        return None

    cpf_limpo = re.sub(r"\D", "", str(cpf))
    return cpf_limpo