import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Acesso negado</h1>

      <p style={styles.message}>
        Você não tem permissão para acessar esta funcionalidade.
      </p>

      <Link to="/" style={styles.link}>
        Voltar para o dashboard
      </Link>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    textAlign: "center",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
  },
  message: {
    fontSize: "1.1rem",
    marginBottom: "1.5rem",
    color: "#555",
  },
  link: {
    textDecoration: "none",
    color: "#007bff",
    fontWeight: "bold",
  },
};
