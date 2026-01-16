## 📌 O que o projeto faz e qual problema resolve

Este projeto consiste em uma API responsável por integrar múltiplas APIs parceiras,
com o objetivo de facilitar a realização de consultas de FGTS, CLT e propostas
relacionadas a ambos.

A API centraliza essas integrações, abstraindo regras de negócio, fallback entre
provedores e padronização de respostas, evitando que o usuário precise lidar
diretamente com múltiplos serviços externos.

<br>

## 🛠️ Principais Tecnologias Utilizadas

- Docker
- Docker Compose
- Node.js
- Express
- Sequelize
- MySQL
- Axios

<br>

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

### Após subir o container, se precisar de instalar uma nova biblioteca no nodeJS, rode esse comando:
```bash
docker exec -it node_app sh
```
Ele vai abrir o terminal do container, dentro dele é possível executar `npm i [biblioteca]` e outros comandos relacionados ao npm do container.

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

<br>

## 📬 Documentação dos Endpoints (Postman)

A documentação completa dos endpoints da API está disponível no Postman,
contendo exemplos de requisições, headers, bodies e respostas.

Acesse pelo link abaixo:

🔗 [Acessar documentação no Postman](https://gabbflor-7245779.postman.co/workspace/Gabb.Flor's-Workspace~4854f2ee-bb73-4c68-82d5-a1a16bf3e365/collection/49809412-48e4728a-767d-4aad-9596-a8fcae2acdc7?action=share&creator=49809412)

<br>

## 🏗️ Arquitetura do Projeto

O projeto utiliza uma arquitetura baseada em MVC combinada com uma arquitetura
em camadas (Layered Architecture), aplicando os padrões Service Layer e Repository Pattern
para garantir separação de responsabilidades e melhor organização do código.

Abaixo está a estrutura de diretórios e a responsabilidade de cada camada:

```text
src
├── config
│   └── db.js                 # Configurações gerais da aplicação (ex: conexão com o banco)
│
├── controllers               # Camada responsável por receber e responder requisições HTTP
│   └── *Controller.js       # Não deve conter regras de negócio ou lógica pesada
│
├── middleware                # Interceptadores de requisições
│   └── *Middleware.js       # Autenticação, autorização por role, validações, etc
│
├── models                    # Modelos das tabelas do banco de dados
│   └── *Model.js            # Definições do Sequelize
│
├── repositories              # Camada de acesso a dados
│   └── *Repository.js       # Responsável por queries e persistência no banco
│
├── routes                    # Definição das rotas da aplicação
│   └── *Routes.js           # Apenas mapeamento de rotas para controllers
│
├── services                  # Núcleo das regras de negócio
│   └── *Service.js          # Orquestra fluxos e decisões do sistema
│   │
│   └── integrations          # Integrações com APIs parceiras
│       └── *Service.js      # Comunicação e regras específicas de APIs externas
│
├── utils                     # Funções utilitárias reutilizáveis
│   └── *Util.js             # Funções puras, sem regra de negócio
│
└── app.js                    # Ponto de entrada da aplicação
```

<br>

## 🔄 Fluxo Principal da Aplicação

O fluxo principal do sistema, que se repete para praticamente todas as funcionalidades,
segue o padrão abaixo:

```text
Router → Controller → Service → Repository → Model
```

- Router: define o endpoint e encaminha a requisição, pode implementar **Middlewares** para autenticações

- Controller: recebe a requisição e delega a execução ao service

- Service: aplica as regras de negócio e orquestra o fluxo

- Repository: realiza operações no banco de dados

- Model: representa a estrutura da tabela no banco