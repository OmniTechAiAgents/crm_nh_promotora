import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import "./Users.css";

export default function EditarSenha() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    async function fetchUsuario() {
        try {
            const response = await api.get(`/usuarios/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUsername(response.data.username);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                navigate("/erro");
                return;
            }

            setMensagem(`Erro ao carregar dados do usuário: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token && id) fetchUsuario();
    }, [token, id]);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setSalvando(true);
            const response = await api.patch(
                `/usuarios/${id}/mudarSenha`,
                { password },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Senha atualizada com sucesso!");

            setTimeout(() => {
                navigate("/usuarios");
            }, 500);

        } catch (error) {
            setMensagem("Erro ao atualizar a senha.");
        } finally {
            setSalvando(false);
        }
    }

    if (loading) {
        return <p className="loading-text">Carregando usuário...</p>;
    }

    return (
        <div className="editar-container">
            <h2>Editar senha do usuário</h2>

            <form onSubmit={handleSubmit} className="editar-form">
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        disabled={true}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Nova senha</label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password-btn"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-unlock" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M12 0a4 4 0 0 1 4 4v2.5h-1V4a3 3 0 1 0-6 0v2h.5A2.5 2.5 0 0 1 12 8.5v5A2.5 2.5 0 0 1 9.5 16h-7A2.5 2.5 0 0 1 0 13.5v-5A2.5 2.5 0 0 1 2.5 6H8V4a4 4 0 0 1 4-4M2.5 7A1.5 1.5 0 0 0 1 8.5v5A1.5 1.5 0 0 0 2.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 9.5 7z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lock" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4M4.5 7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7zM8 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={salvando} className="btn-salvar">
                    {salvando ? "Salvando..." : "Salvar"}
                </button>
            </form>

            {mensagem && <p className="mensagem">{mensagem}</p>}
        </div>
    );
}