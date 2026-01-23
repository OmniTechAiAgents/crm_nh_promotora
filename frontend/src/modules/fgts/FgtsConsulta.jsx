import { useState } from 'react'
import api from '../../api/client'
import Stepper from '../../components/Stepper'
import './fgts.css'

export function FgtsConsulta({ onOfertaEncontrada }) {
  const [cpf, setCpf] = useState('')
  const [status, setStatus] = useState('idle') 
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function consultar() {
    if (!cpf || cpf.length < 11) {
      setError('Informe um CPF válido')
      return
    }

    setStatus('loading')
    setError(null)

    try {
      const response = await api.post('/fgts/consulta', { cpf })
      setResult(response.data)

      if (response.data.status === 'OFFER_AVAILABLE') {
        setStatus('has_offer')

        // 🔑 ponto mais importante:
        onOfertaEncontrada({
          cpf,
          ...response.data
        })
      } else {
        setStatus('no_offer')
      }

    } catch (err) {
      setStatus('error')
      setError('Erro ao consultar o FGTS. Tente novamente.')
    }
  }

  return (
    <div className="card">
      <Stepper step={1} />

      <h2>Consulta FGTS</h2>
      <p>Informe o CPF do cliente para verificar se há oferta disponível.</p>

      <input
        value={cpf}
        onChange={e => setCpf(e.target.value.replace(/\D/g, ''))}
        placeholder="CPF (somente números)"
        maxLength={11}
      />

      <button onClick={consultar} disabled={status === 'loading'}>
        {status === 'loading' ? 'Consultando...' : 'Consultar'}
      </button>

      {status === 'no_offer' && (
        <p className="warning">
          No momento não há oferta disponível. A consulta foi registrada.
        </p>
      )}

      {status === 'error' && (
        <p className="error">
          {error}
        </p>
      )}
    </div>
  )
}
