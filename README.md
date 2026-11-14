# Tarefas API

API REST simples (TypeScript + Node.js + Express) com banco de dados SQL (PostgreSQL), usada para demonstrar
um pipeline de **Integração Contínua (CI)** com GitHub Actions.

## Endpoints

| Método | Rota           | Descrição                      |
| ------ | -------------- | ------------------------------ |
| GET    | `/health`      | Verificação de saúde           |
| GET    | `/tarefas`     | Lista tarefas                  |
| GET    | `/tarefas/:id` | Busca tarefa por id            |
| POST   | `/tarefas`     | Cria tarefa `{ "titulo": "" }` |
| PATCH  | `/tarefas/:id` | Atualiza `titulo`/`concluida`  |
| DELETE | `/tarefas/:id` | Remove tarefa                  |

## Executar localmente

```bash
docker compose up --build        # API em http://localhost:3000
curl -X POST localhost:3000/tarefas -H 'Content-Type: application/json' -d '{"titulo":"Estudar CI"}'
curl localhost:3000/tarefas
```

## Scripts

```bash
npm ci
npm run lint            # análise estática (ESLint + typescript-eslint + eslint-plugin-security)
npm run typecheck       # verificação de tipos (tsc --noEmit)
npm run format:check    # formatação (Prettier)
npm run build           # compila TypeScript e gera dist/
npm run test:unit       # testes unitários (sem banco)
DATABASE_URL=postgres://app:app@localhost:5432/app_test npm run test:integration
```

## Pipeline de CI (`.github/workflows/ci.yml`)

Gatilho: Pull Request para `main`.

`lint` + `format` + `security` (paralelos) → `build` → `unit-tests` → `integration-tests` → `docker`
