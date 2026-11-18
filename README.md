# Ponto Digital — API

API do ponto eletrônico usada pelo `pontofrontend`. Recebe entrada e saída de um funcionário e devolve o histórico daquele e-mail.

Feita em Node.js, Express e TypeScript. Os registros ficam só em memória: ao reiniciar o servidor, o histórico some. A rota `POST /punch` só aceita IPs listados em `AUTHORIZED_IPS`. A rota `GET /report/:email` devolve o histórico sem esse filtro.

## Rotas

- `POST /punch` — corpo JSON com `email`, `password` e `type` (`entrada` ou `saida`)
- `GET /report/:email` — lista os pontos daquele e-mail

## Como rodar

```bash
npm install
npm run dev
```

A porta padrão é `10000`, ou o valor de `PORT`. O CORS está limitado à origem definida em `ALLOWED_ORIGIN`.
