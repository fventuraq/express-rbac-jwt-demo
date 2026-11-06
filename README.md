# Simple RBAC & JWT Authentication Demo

Basic Node.js API demonstrating Role-Based Access Control (RBAC) and JSON Web Tokens (JWT).

## Prerequisites
- Node.js v18+
- Docker & Docker Compose (optional, for local database container)
- PostgreSQL

## Setup
1. Clone repository: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Create database and run `schema.sql`.
4. Configure `.env` file based on `.env.example`.
5. Start server: `npm start`

## Database Setup with Docker

## 🗄️ PostgreSQL com Docker

Banco de dados do projeto roda em um container Docker isolado. Nenhuma instalação local de PostgreSQL é necessária.

### Estrutura esperada

```
db/
├── 01-schema.sql   # DDL: CREATE TABLE ...
└── 02-seed.sql     # DML: INSERT ... (dados iniciais)
```

### 1. Subir o container

```bash
docker run -d \
  --name repo-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=example \
  -p 5434:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine
```

| Flag | Efeito |
|---|---|
| `-d` | Modo *detached* (roda em background). |
| `--name repo-postgres` | Nome fixo para referenciar o container depois. |
| `-e POSTGRES_USER/PASSWORD/DB` | Credenciais e banco criados na primeira inicialização. |
| `-p 5434:5432` | Porta do host `5434` → porta do container `5432`. |
| `-v postgres_data:/var/lib/postgresql/data` | Volume nomeado → dados persistem entre reinícios. |
| `postgres:16-alpine` | Imagem oficial, variante Alpine (leve). |

### 2. Aguardar o banco ficar pronto

```bash
docker logs -f repo-postgres
```

Aguarde a linha `database system is ready to accept connections` e saia com `Ctrl+C` (o container continua rodando).

### 3. Criar o schema e carregar os dados iniciais

Duas formas equivalentes. Escolha **uma**.

**Forma A — enviar os arquivos `.sql` via pipe** (recomendada para CI/automação):

```bash
docker exec -i repo-postgres psql -U postgres -d example < db/01-schema.sql
docker exec -i repo-postgres psql -U postgres -d example < db/02-seed.sql
```

> ⚠️ O `-i` em `docker exec -i` é obrigatório — sem ele o `stdin` fica fechado e o pipe não chega ao `psql`.

**Forma B — abrir um shell interativo dentro do container** (útil para inspecionar o estado):

```bash
docker exec -it repo-postgres bash
psql -U postgres -d example
```

Dentro do `psql`, cole o conteúdo de `01-schema.sql` e depois o de `02-seed.sql`. Alternativamente, use `\i`:

```sql
\i /caminho/absoluto/01-schema.sql
\i /caminho/absoluto/02-seed.sql
```

> ⚠️ Colar **bloco a bloco** funciona, mas é fácil esquecer linhas como `CREATE EXTENSION IF NOT EXISTS pgcrypto;` (que vive no topo do seed). A `Forma A` evita esse tipo de erro.

### 4. Verificar o resultado

```bash
docker exec -it repo-postgres psql -U postgres -d example -c "\dt"
```

Esperado: 7 tabelas (`views`, `funciones`, `view_funcion`, `roles`, `fun_rol`, `persons`, `users`).

**Contagens de sanidade** após o seed:

```bash
docker exec -it repo-postgres psql -U postgres -d example -c "
  SELECT 'roles' AS t, COUNT(*) FROM roles
  UNION ALL SELECT 'funciones',    COUNT(*) FROM funciones
  UNION ALL SELECT 'views',        COUNT(*) FROM views
  UNION ALL SELECT 'view_funcion', COUNT(*) FROM view_funcion
  UNION ALL SELECT 'fun_rol',      COUNT(*) FROM fun_rol
  UNION ALL SELECT 'persons',      COUNT(*) FROM persons
  UNION ALL SELECT 'users',        COUNT(*) FROM users;"
```

| Tabela | Esperado |
|---|---|
| `roles` | 2 |
| `funciones` | 2 (SISTEMA, DADOS) |
| `views` | 5 |
| `view_funcion` | 5 |
| `fun_rol` | 3 (Admin×2 + Administrador×1) |
| `persons` | 2 |
| `users` | 2 |

**Teste de login (valida `pgcrypto` + `crypt` + `gen_salt`):**

```bash
docker exec -it repo-postgres psql -U postgres -d example -c "
  SELECT u.usunam, r.rolnom
  FROM users u JOIN roles r USING (rolid)
  WHERE u.usunam = 'admin'
    AND u.usupas = crypt('Admin123*', u.usupas);"
```

Se retornar **uma linha**, o hash está funcionando.

### 5. Conectar a partir do host

Via `psql`:

```bash
psql -h localhost -p 5434 -U postgres -d example
```

Ou via GUI (DBeaver, pgAdmin, DataGrip):

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Port | `5434` |
| Database | `example` |
| User | `postgres` |
| Password | `123456` |

### 6. Recriar o banco do zero

**Opção A — apagar só o schema, mantendo o container** (rápido, dentro do `psql`):

```sql
DROP TABLE IF EXISTS users, persons, fun_rol, roles, view_funcion, funciones, views CASCADE;
```

Depois re-rode `01-schema.sql` + `02-seed.sql`.

**Opção B — recriar o banco inteiro dentro do mesmo container** (foi o que usamos):

```bash
docker exec -i repo-postgres psql -U postgres -c "DROP DATABASE IF EXISTS example"
docker exec -i repo-postgres psql -U postgres -c "CREATE DATABASE example"
docker exec -i repo-postgres psql -U postgres -d example < db/01-schema.sql
docker exec -i repo-postgres psql -U postgres -d example < db/02-seed.sql
```

> ℹ️ `DROP DATABASE` **não pode** rodar dentro de uma sessão já conectada ao próprio banco. Por isso ele é feito com `psql -c` (sem `-d example`), o que conecta implicitamente ao banco `postgres`. É por isso que não passamos `-d` nesses dois comandos.

**Opção C — apagar tudo (container + volume):**

```bash
docker rm -f repo-postgres
docker volume rm postgres_data
# voltar ao passo 1
```

### 🩺 Troubleshooting

Os três erros abaixo são os mais comuns durante a montagem — todos reproduzidos pelos próprios alunos.

**1. `syntax error at or near "FOREIGN"` ao criar `USERS`**

Falta de vírgula após a última coluna, antes das `CONSTRAINT`:

```sql
-- ❌ erro
EstReg CHAR(1) DEFAULT 'A'                  -- ← sem vírgula
CONSTRAINT fk_person FOREIGN KEY ...

-- ✅ correto
EstReg CHAR(1) DEFAULT 'A',
CONSTRAINT fk_person FOREIGN KEY ...
```

Regra geral: **toda coluna na lista do `CREATE TABLE` termina com vírgula**, inclusive a última antes das `CONSTRAINT`.

**2. `violates check constraint "views_vieest_check"`**

O `CHECK` do DDL e o valor do seed precisam concordar. Se o DDL diz `IN ('A','I')`, o seed deve inserir `'A'` ou `'I'` — não `'ACTIVO'`/`'INACTIVO'`, e vice-versa.

```sql
-- DDL
VieEst VARCHAR(10) CHECK (VieEst IN ('A','I')) NOT NULL,

-- seed (bate com o CHECK acima)
INSERT INTO views (vienom, ..., vieest, ...) VALUES ('Views', ..., 'A', ...);
```

**3. `function gen_salt(unknown, integer) does not exist`**

`crypt()` e `gen_salt()` vêm da extensão **`pgcrypto`**, que **não é carregada por padrão**. O seed precisa da primeira linha:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Rode-a sozinha e confirme:

```sql
SELECT extname FROM pg_extension WHERE extname = 'pgcrypto';
```

Se a linha existir, os `INSERT INTO users ...` passam a funcionar.

### 🧠 Comandos úteis do dia a dia

```bash
docker ps                          # container está rodando?
docker logs --tail 50 repo-postgres # últimas linhas de log
docker exec -it repo-postgres psql -U postgres -d example   # abrir psql interativo
docker stop repo-postgres          # parar (dados ficam no volume)
docker start repo-postgres         # iniciar novamente
```

## API Endpoints
- `POST /api/auth/login` - Authenticate user & return JWT.
- `GET /api/roles` - Protected route (requires `Authorization: Bearer <token>`).