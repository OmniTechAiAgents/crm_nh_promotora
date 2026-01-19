function VerifyCpfMask(cpf) {
    return /[^\d]/.test(cpf);
}

export default VerifyCpfMask;