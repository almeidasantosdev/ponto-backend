import {
  DEFAULT_ALLOWED_ORIGIN,
  DEFAULT_AUTHORIZED_IPS,
  getAllowedOrigin,
  getAuthorizedIps,
  resolvePort,
} from './config';

describe('configuração', () => {
  const original = {
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
    AUTHORIZED_IPS: process.env.AUTHORIZED_IPS,
    PORT: process.env.PORT,
  };

  afterEach(() => {
    restore('ALLOWED_ORIGIN', original.ALLOWED_ORIGIN);
    restore('AUTHORIZED_IPS', original.AUTHORIZED_IPS);
    restore('PORT', original.PORT);
  });

  it('usa a origem que estava fixa no servidor anterior quando a variável não existe', () => {
    delete process.env.ALLOWED_ORIGIN;
    expect(getAllowedOrigin()).toBe(DEFAULT_ALLOWED_ORIGIN);
  });

  it('lê ALLOWED_ORIGIN do ambiente', () => {
    process.env.ALLOWED_ORIGIN = 'https://pontofrontend.vercel.app';
    expect(getAllowedOrigin()).toBe('https://pontofrontend.vercel.app');
  });

  it('usa 127.0.0.1 e ::1 quando AUTHORIZED_IPS não existe', () => {
    delete process.env.AUTHORIZED_IPS;
    expect(getAuthorizedIps()).toEqual([...DEFAULT_AUTHORIZED_IPS]);
  });

  it('separa e remove espaços da lista de IPs', () => {
    process.env.AUTHORIZED_IPS = '10.0.0.8, 10.1.0.9';
    expect(getAuthorizedIps()).toEqual(['10.0.0.8', '10.1.0.9']);
  });

  it('não altera a lista padrão se o resultado for modificado', () => {
    delete process.env.AUTHORIZED_IPS;
    getAuthorizedIps().push('10.9.9.9');
    expect(getAuthorizedIps()).toEqual([...DEFAULT_AUTHORIZED_IPS]);
  });

  it('usa a porta 10000 quando PORT não existe', () => {
    delete process.env.PORT;
    expect(resolvePort()).toBe(10000);
  });

  it('lê PORT numérica do ambiente', () => {
    process.env.PORT = '3000';
    expect(resolvePort()).toBe(3000);
  });

  it('recusa PORT que não é um número de porta', () => {
    process.env.PORT = 'abc';
    expect(() => resolvePort()).toThrow('PORT inválida: abc');
  });
});

function restore(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}
