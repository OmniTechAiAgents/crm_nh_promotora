import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export function Propostas() {
  const [propostas, setPropostas] = useState([]);

  async function load() {
    const response = await api.get('/propostas');
    setPropostas(response.data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section>
      <h2>Propostas</h2>

      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Bruto</th>
            <th>Líquido</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {propostas.map(p => (
            <tr key={p.id}>
              <td>{p.cliente}</td>
              <td>{p.bruto}</td>
              <td>{p.liquido}</td>
              <td>{p.status}</td>
              <td>
                {p.allowedActions?.includes('SEND_WHATSAPP') && (
                  <a href={p.whatsappLink} target="_blank">WhatsApp</a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
