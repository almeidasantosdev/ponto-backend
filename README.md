# Ponto Digital — API

API de ponto eletrônico usada pelo [ponto-frontend](https://github.com/almeidasantosdev/ponto-frontend). O funcionário registra entrada ou saída e consulta o histórico daquele e-mail.

O contrato que o frontend usa hoje:

- `POST /punch` com JSON `{ "email", "password", "type" }`. O frontend envia `type` como `entrada` ou `saida`.
- Sucesso em `201`, com `{ "message", "data" }`. A tela exibe `message`.
- `GET /report/:email` devolve um array. A tabela usa `type`, `timestamp` e `ip`.

## Stack

- Node.js 24 e TypeScript
- NestJS 12, no adaptador Express. O pacote é ESM; `npm test` sobe o Jest com o suporte de módulos do Node 24
- registros em memória, no processo
- Jest e Supertest
- Docker e Kubernetes (`k8s/`)
- GitHub Actions

Não há fila, Postgres nem cadastro de usuário. `jsonwebtoken` estava no `package.json` antigo e não era chamado pelo servidor; esta versão não carrega essa dependência.

## Comportamento

`POST /punch` exige `email`, `password` e `type`. Se algum vier vazio ou ausente, a resposta é `400`:

```json
{ "error": "Dados insuficientes." }
```

A senha não é conferida com uma base de usuários e não é gravada.

O horário do registro é o do servidor. Um `timestamp` mandado no corpo é ignorado. O IP gravado é o primeiro valor de `x-forwarded-for`. Se esse header não vier como texto, usa-se o endereço do socket. Um campo `ip` no corpo também é ignorado.

`POST /punch` só aceita os IPs de `AUTHORIZED_IPS`. Fora da lista, a resposta é `403`:

```json
{ "error": "Acesso negado. Este dispositivo não está na rede autorizada." }
```

`GET /report/:email` não passa por esse filtro. Quem souber o e-mail lê o histórico. A comparação do e-mail é exata.

Os registros ficam num array em memória. Reiniciar o processo apaga o histórico. Cada réplica teria a própria lista, então o Deployment de exemplo usa `replicas: 1`.

`GET /health` responde `{ "status": "ok" }`. Essa rota não existia no servidor Express e serve para as probes.

O CORS aceita a origem de `ALLOWED_ORIGIN`, os métodos `GET` e `POST`, com `credentials`. O padrão continua `https://seu-projeto-ponto.vercel.app`, que era o valor fixo no código. O frontend publicado em `https://pontofrontend.vercel.app` só chama a API pelo navegador se `ALLOWED_ORIGIN` for essa origem.

Sem `ALLOWED_ORIGIN` e sem `AUTHORIZED_IPS`, valem esses padrões (`127.0.0.1` e `::1` na lista de IPs). O README antigo citava as variáveis, mas o código ignorava o ambiente.

O processo escuta em `0.0.0.0` (IPv4), na porta `PORT` (padrão `10000`). Na máquina local, chame `127.0.0.1`: `localhost` pode ir para IPv6 e não alcançar esse socket.

## Como rodar

```bash
npm install
npm run start:dev
```

Depois do build:

```bash
npm run build
npm start
```

As variáveis de exemplo estão em `.env.example`. O arquivo `.env` fica de fora do Git.

## Testes e lint

```bash
npm test
npm run lint
npm run build
```

`npm test` roda o Jest em banda única: testes unitários das regras e testes e2e das rotas com Supertest. Não há Postgres neste projeto. Os testes usam o mesmo armazenamento em memória da API.

Os testes unitários cobrem dados obrigatórios, senha fora do registro, horário do servidor, histórico por e-mail e a lista de IPs. Os e2e cobrem `/health`, `/punch`, `/report/:email` e o CORS.

## Docker

```bash
docker build -t ponto-backend:local .
docker run --rm -p 10000:10000 \
  -e ALLOWED_ORIGIN=https://pontofrontend.vercel.app \
  -e AUTHORIZED_IPS=127.0.0.1,::1 \
  ponto-backend:local
```

A imagem tem três estágios: dependências, build e execução. O estágio final fica só com o necessário para `node dist/main.js` e roda com o usuário `node`. O healthcheck da imagem chama `GET /health`.

## Kubernetes

Os arquivos em `k8s/` são um exemplo para cluster local:

| Arquivo | Função |
| --- | --- |
| `configmap.yaml` | `PORT`, `NODE_ENV` e `ALLOWED_ORIGIN` |
| `secret.example.yaml` | `AUTHORIZED_IPS` de exemplo, só loopback. Não coloque IP real de rede aqui |
| `deployment.yaml` | uma réplica, imagem `ponto-backend:local`, probes em `/health` |
| `service.yaml` | porta `10000` |

```bash
kind create cluster --name ponto
docker build -t ponto-backend:local .
kind load docker-image ponto-backend:local --name ponto
kubectl apply -f k8s/
kubectl rollout status deployment/ponto-backend
kubectl port-forward svc/ponto-backend 10000:10000
```

Em outro terminal:

```bash
curl -fsS http://127.0.0.1:10000/health
```

`ponto-backend:local` não está em registry nenhum. Em outro cluster, publique a imagem e altere o campo `image`. `imagePullPolicy: IfNotPresent` existe para o Kind, que recebe a imagem com `kind load`.

Este repositório não tem arquivo de deploy de produção (Render ou outro). Para publicar, defina `PORT`, `ALLOWED_ORIGIN` e `AUTHORIZED_IPS` no ambiente do serviço. Atrás de proxy, o IP do cliente precisa chegar em `x-forwarded-for`.

## CI

`.github/workflows/ci.yml` roda em pull request e em push na `main`:

1. `npm ci`, lint, build e `npm test`
2. sobe um cluster Kind, aplica `k8s/` e consulta `/health`

## Frontend

A interface está em [ponto-frontend](https://github.com/almeidasantosdev/ponto-frontend). A URL da API está fixa em `src/App.tsx` de lá e precisa apontar para onde esta API estiver publicada.
