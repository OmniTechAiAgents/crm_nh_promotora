import { useState } from 'react'
import api from '../../api/client'
import './fgts.css'

export function FgtsPropostaModal({ cpf, availableValue, onClose }) {
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    valor: availableValue
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function criarProposta() {
    setLoading(true)

    try {
      const response = await api.post('/fgts/propostas', {
        cpf,
        ...form
      })

      setResult(response.data)
    } catch (err) {
      alert('Erro ao criar proposta')
    } finally {
      setLoading(false)
    }
  }

  function enviarWhatsapp() {
    const msg = `Olá! Segue o link para formalização do seu FGTS: ${result.formalizationLink}`
    const url = `https://wa.me/55${form.telefone}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  return (
    <div className="modal-overlay">
      <div className="modal">

        {!result && (
          <>
            <h3>Digitar proposta FGTS</h3>

            <div className="form-group">
              <label>CPF</label>
              <input value={cpf} disabled />
            </div>

            <div className="form-group">
              <label>Nome completo</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Telefone (WhatsApp)</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Valor</label>
              <input
                name="valor"
                value={form.valor}
                onChange={handleChange}
              />
            </div>

            <div className="modal-actions">
              <button onClick={onClose} className="secondary">
                Cancelar
              </button>

              <button
                onClick={criarProposta}
                className="primary"
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar proposta'}
              </button>
            </div>
          </>
        )}

        {result && (
          <>
            <h3>✅ Proposta criada</h3>

            <p><strong>Valor:</strong> R$ {result.valor}</p>
            <p><strong>Status:</strong> {result.status}</p>

            <div className="modal-actions">
              <button
                onClick={() => navigator.clipboard.writeText(result.formalizationLink)}
              >
                Copiar link
              </button>

              <button onClick={enviarWhatsapp}>
                Enviar WhatsApp
              </button>

              <button className="primary" onClick={onClose}>
                Concluir
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
