import './stepper.css'

export default function Stepper({ step }) {
  return (
    <div className="stepper">
      <div className={step === 1 ? 'active' : ''}>Consulta</div>
      <span>→</span>
      <div className={step === 2 ? 'active' : ''}>Oferta</div>
      <span>→</span>
      <div className={step === 3 ? 'active' : ''}>Proposta</div>
    </div>
  )
}
