export const DEFAULT_ALLOWED_ORIGIN = 'https://seu-projeto-ponto.vercel.app';
export const DEFAULT_AUTHORIZED_IPS = ['127.0.0.1', '::1'] as const;
export const DEFAULT_PORT = 10000;

export function getAllowedOrigin(): string {
  return process.env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN;
}

export function getAuthorizedIps(): string[] {
  const raw = process.env.AUTHORIZED_IPS;
  if (raw === undefined) {
    return [...DEFAULT_AUTHORIZED_IPS];
  }

  return raw
    .split(',')
    .map((ip) => ip.trim())
    .filter((ip) => ip.length > 0);
}

export function resolvePort(): number {
  const raw = process.env.PORT || String(DEFAULT_PORT);
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`PORT inválida: ${raw}`);
  }
  return port;
}
