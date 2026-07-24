export default function extractBestPhoneNumber(celulares) {
    const telefones = Array.isArray(celulares) ? celulares : [];
    const telefonePrioritario = telefones.find(t => t.ranking === 1 && t.whatsapp)
        || telefones.find(t => t.whatsapp)
        || telefones[0]
        || { ddd: '', numero: '' };

    return {
        ddd: String(telefonePrioritario.ddd ?? '').padStart(2, '0'),
        numero: String(telefonePrioritario.numero ?? '').replace(/\D/g, '')
    };
}
