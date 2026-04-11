<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GUI.A Digital — build + produção + login JWT

Este repositório agora está pronto para:

- Build de frontend para produção (`vite build`)
- Subida de API em modo produção (`node server.mjs`)
- Execução automática de migrations (`npm run migrate`)
- Resposta de login com JWT válido (`POST /auth/login`)

## Rodar local / produção

1. Instale dependências:

```bash
npm install
```

2. (Opcional) Defina variáveis:

```bash
export JWT_SECRET='troque-este-segredo'
export PORT=3000
export SEED_ADMIN_EMAIL='admin@guiadigital.local'
export SEED_ADMIN_PASSWORD='admin123'
```

3. Execute fluxo completo de produção:

```bash
npm run start:prod
```

Esse comando faz, nesta ordem:
1. `npm run build`
2. `npm run migrate`
3. `npm run start:api`

## Migrations

A migration é idempotente e aplicada por:

```bash
npm run migrate
```

Banco (arquivo JSON):

- `data/db.json`

Schema atual:

- `schemaVersion: 2`

## Login JWT

Endpoint:

- `POST /auth/login`

Payload:

```json
{
  "email": "admin@guiadigital.local",
  "password": "admin123"
}
```

Resposta de sucesso:

```json
{
  "token": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 28800,
  "user": {
    "id": "admin",
    "email": "admin@guiadigital.local",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
}
```

Healthcheck:

- `GET /health`
