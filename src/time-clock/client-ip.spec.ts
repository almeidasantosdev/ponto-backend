import { Request } from 'express';
import { extractClientIp } from './client-ip';

function asRequest(ipHeader: string | string[] | undefined, remoteAddress?: string): Request {
  return {
    headers: ipHeader === undefined ? {} : { 'x-forwarded-for': ipHeader },
    socket: { remoteAddress },
  } as unknown as Request;
}

describe('extractClientIp', () => {
  it('usa o primeiro IP de x-forwarded-for, sem espaços', () => {
    expect(extractClientIp(asRequest(' 203.0.113.5 , 10.0.0.1', '127.0.0.1'))).toBe(
      '203.0.113.5',
    );
  });

  it('ignora x-forwarded-for quando o header não é texto e usa o socket', () => {
    expect(
      extractClientIp(asRequest(['203.0.113.5', '10.0.0.1'], '127.0.0.1')),
    ).toBe('127.0.0.1');
  });

  it('usa o endereço do socket quando não há header', () => {
    expect(extractClientIp(asRequest(undefined, '::1'))).toBe('::1');
  });

  it('devolve undefined quando o socket não tem endereço', () => {
    expect(extractClientIp(asRequest(undefined, undefined))).toBeUndefined();
  });
});
