## 🚀 Como rodar o projeto em modo de desenvolvimento

### 📋 Requisitos
- Docker
- Docker Compose

---

### 🧱 Primeira vez (após clonar o repositório)

Esse comando:
- builda as imagens
- instala as dependências
- sobe todos os containers

```bash
git clone https://github.com/OmniTechAiAgents/crm_nh_promotora
cd crm_nh_promotora
docker compose up --build
```

A aplicação ficará disponível em:
- API Node: http://localhost:3000
- MySQL: porta 3306

---

### 🔄 Uso no dia a dia (em background)

Após a primeira build, para rodar normalmente:

```bash
docker compose up -d
```

O -d (detached) roda os containers em segundo plano.
O Nodemon já cuida do hot reload automaticamente.

---

### 🛑 Interromper a execução dos containers

Para parar os containers sem perder dados:

```bash
docker compose stop
```

Depois, para voltar a rodar:

```bash
docker compose up
```

---

### ⚠️ Observações importantes
- A pasta node_modules não é versionada
- As dependências são instaladas automaticamente via Docker
- Para mudanças em Dockerfile ou dependências, use:
  ```bash
  docker compose up --build
  ```
