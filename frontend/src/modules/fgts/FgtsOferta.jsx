import { useState } from 'react'
import Stepper from '../../components/Stepper'
import { FgtsPropostaModal } from './FgtsPropostaModal'
import './fgts.css'

export function FgtsOferta({ data, cpf }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="card">
      <Stepper step={2} />

      <h2>Oferta Disponível</h2>
      <p>Encontramos uma condição para este CPF.</p>

      <div className="offer-box">
        <div className="offer-item">
          <span>Produto</span>
          <strong>Saque-Aniversário FGTS</strong>
        </div>

        <div className="offer-item">
          <span>Valor disponível</span>
          <strong className="value">
            R$ {data.availableValue}
          </strong>
        </div>
      </div>

      <button className="primary" onClick={() => setShowModal(true)}>
        Digitar proposta
      </button>

      {showModal && (
        <FgtsPropostaModal
          cpf={cpf}
          availableValue={data.availableValue}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
