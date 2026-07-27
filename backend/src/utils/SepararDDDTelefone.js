export default function SepararDDDTelefone(numeroCompleto) {
  const str = String(numeroCompleto).replace(/\D/g, '');

  return {
    ddd: str.slice(0, 2),
    numero: str.slice(2)
  };
}