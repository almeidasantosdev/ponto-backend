import { NextFunction, Request, Response } from 'express';
import { IpAllowlistMiddleware } from './ip-allowlist.middleware';

describe('IpAllowlistMiddleware', () => {
  const original = process.env.AUTHORIZED_IPS;
  let middleware: IpAllowlistMiddleware;

  beforeEach(() => {
    process.env.AUTHORIZED_IPS = '127.0.0.1,::1';
    middleware = new IpAllowlistMiddleware();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.AUTHORIZED_IPS;
    } else {
      process.env.AUTHORIZED_IPS = original;
    }
    jest.restoreAllMocks();
  });

  it('segue o fluxo quando o IP está na lista', () => {
    const next = jest.fn() as NextFunction;
    const res = mockResponse();

    middleware.use(requestWithIp('127.0.0.1'), res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responde 403 com o texto antigo quando o IP está fora da lista', () => {
    const next = jest.fn() as NextFunction;
    const res = mockResponse();

    middleware.use(requestWithIp('203.0.113.10'), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Acesso negado. Este dispositivo não está na rede autorizada.',
    });
    expect(console.log).toHaveBeenCalledWith(
      '[BLOQUEADO] Tentativa de acesso do IP: 203.0.113.10',
    );
  });
});

function requestWithIp(ip: string): Request {
  return {
    headers: { 'x-forwarded-for': ip },
    socket: { remoteAddress: '10.0.0.1' },
  } as unknown as Request;
}

function mockResponse(): Response {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as Response;
}
