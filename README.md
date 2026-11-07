# Simple RBAC & JWT Authentication Demo

API + interface web demonstrando **Role-Based Access Control (RBAC)** com **JWT**, usando Node.js no backend e React no frontend. Serve como projeto de referência para autenticação, autorização por papéis (roles) e CRUDs relacionados a esse domínio.

---

## 🧱 Stack

- **Banco de dados** → PostgreSQL 16 (container Docker)
- **Backend** → Node.js + Express + `jsonwebtoken` + `bcryptjs`
- **Frontend** → React (CRA) + Material UI + React Query + React Router
- **Autenticação** → JWT (`Authorization: Bearer <token>`)
- **Hash de senha** → bcrypt via `pgcrypto` (banco) + `bcryptjs` (verificação)

---

## 📁 Estrutura do repositório

    .
    ├── db/
    │   ├── schema.sql          # DDL: criação das tabelas
    │   └── data_init.sql            # DML: dados iniciais (roles, users, views...)
    ├── backend/
    │   ├── src/
    │   │   ├── app.js             # entry point do Express
    │   │   ├── config/db.js       # pool de conexão com Postgres
    │   │   ├── middleware/
    │   │   │   └── verifyToken.js # injeta req.user
        │   │   └── auth.js # valida JWT
    │   │   ├── routes/            # /api/* (auth, views, functions, roles...)
    │   │   ├── controllers/       # traduz HTTP ↔ service
    │   │   └── services/          # regras de negócio + queries SQL
    │   ├── .env.example
    │   └── package.json
    └── frontend/
        ├── src/
        │   ├── api/               # axiosInstance + adminService
        │   ├── context/           # AuthProvider (login, logout, menu)
        │   ├── hooks/             # useViews, useFunctions, useRoles
        │   ├── components/        # Dashboards e Forms
        │   ├── pages/             # Views, Functions, Roles, Persons, Users
        │   ├── routes/            # PrivateRoute
        │   ├── App.jsx
        │   └── index.js
        └── package.json
        └── .env.example

## ✅ Pré-requisitos

- **Node.js** v18 ou superior
- **npm** v9 ou superior
- **Docker** (para o banco de dados)

---

## 🗄️ Banco de dados com Docker

O PostgreSQL roda em um container isolado. Nenhuma instalação local é necessária.

### 1. Subir o container

    docker run -d \
      --name repo-postgres \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=123456 \
      -e POSTGRES_DB=example \
      -p 5434:5432 \
      -v postgres_data:/var/lib/postgresql/data \
      postgres:16-alpine

**Flags usadas:**

- `-d` → modo *detached* (background)
- `--name repo-postgres` → nome fixo para referenciar o container
- `-e POSTGRES_USER/PASSWORD/DB` → credenciais e banco criados na primeira inicialização
- `-p 5434:5432` → porta host `5434` mapeada para a porta container `5432`
- `-v postgres_data:/var/lib/postgresql/data` → volume nomeado (dados persistem entre reinícios)
- `postgres:16-alpine` → imagem oficial, variante Alpine (leve)

### 2. Aguardar o banco ficar pronto

    docker logs -f repo-postgres

Aguarde a linha `database system is ready to accept connections` e saia com `Ctrl+C` (o container continua rodando).

### 3. Criar o schema e carregar os dados iniciais

**Forma A — enviar os arquivos `.sql` via pipe** (recomendada):

    docker exec -i repo-postgres psql -U postgres -d example < db/schema.sql
    docker exec -i repo-postgres psql -U postgres -d example < db/data_init.sql

> ⚠️ O `-i` em `docker exec -i` é **obrigatório** — sem ele o `stdin` fica fechado e o pipe não chega ao `psql`.

**Forma B — shell interativo dentro do container** (útil para inspecionar o estado):

    docker exec -it repo-postgres bash
    psql -U postgres -d example

Dentro do `psql`, use `\i /caminho/absoluto/01-schema.sql` e depois `\i /caminho/absoluto/02-seed.sql`.

> ⚠️ Colar **bloco a bloco** funciona, mas é fácil esquecer linhas como `CREATE EXTENSION IF NOT EXISTS pgcrypto;` (que vive no topo do seed). A **Forma A** evita esse tipo de erro.

### 4. Verificar o resultado

    docker exec -it repo-postgres psql -U postgres -d example -c "\dt"

Esperado: **7 tabelas** → `views`, `funciones`, `view_funcion`, `roles`, `fun_rol`, `persons`, `users`.

**Contagens de sanidade** após o seed:

    docker exec -it repo-postgres psql -U postgres -d example -c "
      SELECT 'roles' AS t, COUNT(*) FROM roles
      UNION ALL SELECT 'funciones',    COUNT(*) FROM funciones
      UNION ALL SELECT 'views',        COUNT(*) FROM views
      UNION ALL SELECT 'view_funcion', COUNT(*) FROM view_funcion
      UNION ALL SELECT 'fun_rol',      COUNT(*) FROM fun_rol
      UNION ALL SELECT 'persons',      COUNT(*) FROM persons
      UNION ALL SELECT 'users',        COUNT(*) FROM users;"

**Contagens esperadas:**

- `roles` → 2
- `funciones` → 2 (`SISTEMA`, `DADOS`)
- `views` → 5
- `view_funcion` → 5
- `fun_rol` → 3
- `persons` → 2
- `users` → 2

**Teste de login (valida `pgcrypto` + `crypt` + `gen_salt`):**

    docker exec -it repo-postgres psql -U postgres -d example -c "
      SELECT u.usunam, r.rolnom
      FROM users u JOIN roles r USING (rolid)
      WHERE u.usunam = 'admin'
        AND u.usupas = crypt('Admin123*', u.usupas);"

Se retornar **uma linha**, o hash está funcionando.

### 5. Conectar a partir do host

Via `psql`:

    psql -h localhost -p 5434 -U postgres -d example

Via GUI (DBeaver, pgAdmin, DataGrip) — **valores de conexão:**

- **Host** → `localhost`
- **Port** → `5434`
- **Database** → `example`
- **User** → `postgres`
- **Password** → `123456`

### 6. Recriar o banco do zero

**Opção A — apagar só o schema, mantendo o container** (dentro do `psql`):

    DROP TABLE IF EXISTS users, persons, fun_rol, roles, view_funcion, funciones, views CASCADE;

Depois re-rode `01-schema.sql` + `02-seed.sql`.

**Opção B — recriar o banco inteiro dentro do mesmo container:**

    docker exec -i repo-postgres psql -U postgres -c "DROP DATABASE IF EXISTS example"
    docker exec -i repo-postgres psql -U postgres -c "CREATE DATABASE example"
    docker exec -i repo-postgres psql -U postgres -d example < db/schema.sql
    docker exec -i repo-postgres psql -U postgres -d example < db/data_init.sql

> ℹ️ `DROP DATABASE` **não pode** rodar dentro de uma sessão conectada ao próprio banco. Por isso ele é feito com `psql -c` (sem `-d example`), o que conecta implicitamente ao banco `postgres`.

**Opção C — apagar tudo (container + volume):**

    docker rm -f repo-postgres
    docker volume rm postgres_data
    # voltar ao passo 1

## 🚀 Backend

### 1. Instalar dependências

    cd backend
    npm install

### 2. Criar o `.env`

    cp .env.example .env

`.env` mínimo:

    # Server
    PORT=3000

    # JWT
    JWT_SECRET=uma_string_longa_e_aleatoria_aqui
    JWT_EXPIRATION=1h

    # Postgres (mesmos valores do `docker run`)
    DB_HOST=localhost
    DB_PORT=5434
    DB_USER=postgres
    DB_PASSWORD=123456
    DB_NAME=example

> 💡 Gere um `JWT_SECRET` com:
>
>     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

Formatos válidos para `JWT_EXPIRATION`: `3600` (segundos), `"1h"`, `"7d"`, `"30m"`.

### 3. Subir o servidor

    npm run dev      # com nodemon (recomendado em desenvolvimento)
    # ou
    npm start        # sem watch

Saída esperada:

    Server running on port 3000

### 4. Testar a autenticação

    curl -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"usunam":"admin","usupas":"Admin123*"}'

Resposta esperada (resumida):

    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": { "EmpID": 1, "NomUsu": "admin", "RolID": 1, "EmpCargo": "Admin" },
      "menu": [
        { "funid": 2, "funnom": "DADOS",   "ventanas": [ {...}, {...} ] },
        { "funid": 1, "funnom": "SISTEMA", "ventanas": [ {...}, {...}, {...} ] }
      ]
    }

O campo `menu` já vem **filtrado pelo role do usuário** — é isso que o frontend usa para montar a sidebar.

---

## 💻 Frontend

### 1. Instalar dependências

    cd frontend
    npm install

### 2. Criar o `.env`

    cp .env.example .env

`.env` mínimo:
    
    PORT=4000
    REACT_APP_API_URL=http://localhost:3000/api

### 3. (Opcional) Configurar URL do backend

Se o `axiosInstance` apontar para `REACT_APP_API_URL`, nada a fazer. Caso contrário, ajuste em `src/api/axiosInstance.js`:

    const axiosInstance = axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        timeout: 10000,
    });

### 4. Subir o servidor de desenvolvimento

    npm start

O CRA abre automaticamente em `http://localhost:4000` (ou `3000` — o CRA detecta o próximo disponível).

---

## 👤 Credenciais de teste

Criadas pelo `02-seed.sql`:

- **`admin`** / senha **`Admin123*`** → role **Admin** → acesso a **SISTEMA + DADOS (tudo)**
- **`adm`** / senha **`Adm123*`** → role **Administrador** → acesso apenas a **DADOS**

Ambos têm hash gerado por `crypt(pw, gen_salt('bf', 10))`. O backend valida com `bcryptjs.compare()`.

## 🔐 Como o RBAC funciona neste projeto

O modelo tem **4 camadas**:

    USERS ──▶ ROLES ──▶ FUNCIONES ──▶ VIEWS
     (1)       (2)         (3)          (4)

**O que cada camada representa:**

- **`users`** → conta de login. Aponta para **1 role**.
- **`roles`** → papel do usuário (`Admin`, `Administrador`...).
- **`funciones`** → **grupos de permissão** (`SISTEMA`, `DADOS`).
- **`views`** → **telas** do frontend (`/views`, `/functions`, `/roles`...).

**Tabelas de ligação:**

- **`fun_rol`** → quais funções cada role tem.
- **`view_funcion`** → quais telas cada função libera.

**Fluxo no login:**

1. Frontend envia `{ usunam, usupas }` para `POST /api/auth/login`.
2. Backend valida a senha (`bcrypt.compare`).
3. Backend faz `JOIN` de `roles → fun_rol → funciones → view_funcion → views`, **filtrado pelo `rolid` do usuário**.
4. Retorna `{ token, user, menu }`.
5. Frontend guarda o `menu` em `localStorage` e monta a **sidebar** e as **rotas** dinamicamente.
6. Cada requisição subsequente envia `Authorization: Bearer <token>`.
7. O middleware `verifyToken` valida o JWT e injeta `req.user`.

---

## 🔌 Endpoints da API

Todos (exceto `POST /auth/login`) exigem `Authorization: Bearer <token>`.

### Auth

- `POST /api/auth/login` → autentica e retorna `{ token, user, menu }`

### Views

- `GET /api/views` → lista todas as views
- `GET /api/views/:id` → detalhe de uma view
- `POST /api/views` → cria uma view
- `PUT /api/views/:id` → atualiza uma view
- `DELETE /api/views/:id` → desativa (soft delete → `estreg='I'`)

### Functions

- `GET /api/functions` → lista funções + array `ventanas` (vieids)
- `GET /api/functions/:id` → detalhe
- `POST /api/functions` → cria função + associações em `view_funcion`
- `PUT /api/functions/:id` → atualiza função + reassocia views
- `DELETE /api/functions/:id` → desativa (bloqueia se houver role ativo usando)

### Roles

- `GET /api/roles` → lista roles + array `funcs` (funids)
- `GET /api/roles/:id` → detalhe
- `POST /api/roles` → cria role + associações em `fun_rol`
- `PUT /api/roles/:id` → atualiza role + reassocia funções
- `DELETE /api/roles/:id` → desativa (bloqueia se houver usuário ativo)

### Persons / Users

- `GET/POST /api/persons` → CRUD de pessoas físicas (disable)
- `GET/POST /api/employees` → CRUD de usuários (disable)

> ℹ️ **Soft delete** significa que `DELETE` **não** remove a linha — apenas marca `estreg = 'I'`. Isso preserva histórico e evita quebrar FKs. A sidebar e as listagens filtram `estreg = 'A'` automaticamente.


## 🧠 Comandos úteis do dia a dia

**Banco:**

    docker ps                                                   # container rodando?
    docker logs --tail 50 repo-postgres                         # últimas linhas
    docker exec -it repo-postgres psql -U postgres -d example   # abrir psql
    docker stop repo-postgres                                   # parar (dados ficam)
    docker start repo-postgres                                  # iniciar novamente

**Backend:**

    cd backend && npm run dev                                   # subir com nodemon
    curl -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"usunam":"admin","usupas":"Admin123*"}'              # testar login

**Frontend:**

    cd frontend && npm start                                    # subir CRA

---

## 📚 Para ir além

Tópicos que este projeto ilustra e que valem estudo:

- **JWT lifecycle** → payload, assinatura, expiração, verificação em middleware.
- **Hash de senha** → por que **nunca** guardar texto puro; `bcrypt` vs `pgcrypto`.
- **Modelo RBAC** → separar *quem é o usuário* (role) do *que ele pode acessar* (functions → views).
- **Soft delete** → preservar histórico sem quebrar FKs.
- **React Query** → cache, invalidação e mutações com `onSuccess`/`onError`.
- **Proteção de rotas** → `PrivateRoute` + renderização dinâmica de `<Route>` a partir do menu.