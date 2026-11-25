import { TimeClockService } from './time-clock.service';

describe('TimeClockService', () => {
  let service: TimeClockService;

  beforeEach(() => {
    service = new TimeClockService();
  });

  it('grava entrada com o horário do servidor e o IP recebido, sem a senha', () => {
    const before = Date.now();
    const result = service.punch(
      {
        email: 'ana@example.com',
        password: 'segredo',
        type: 'entrada',
        timestamp: '1999-01-01T00:00:00.000Z',
        ip: '9.9.9.9',
      },
      '127.0.0.1',
    );

    expect(result).toEqual({
      message: 'Ponto de entrada batido com sucesso!',
      data: {
        email: 'ana@example.com',
        type: 'entrada',
        timestamp: expect.any(Date),
        ip: '127.0.0.1',
      },
    });

    if (!('data' in result)) {
      return;
    }

    expect(Object.keys(result.data).sort()).toEqual([
      'email',
      'ip',
      'timestamp',
      'type',
    ]);
    expect(result.data.timestamp.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.data.timestamp.toISOString()).not.toBe(
      '1999-01-01T00:00:00.000Z',
    );
    expect(JSON.stringify(result)).not.toContain('segredo');
  });

  it('aceita saída com a mesma mensagem do servidor anterior', () => {
    const result = service.punch(
      { email: 'ana@example.com', password: 'segredo', type: 'saida' },
      '::1',
    );
    expect(result).toMatchObject({
      message: 'Ponto de saida batido com sucesso!',
      data: { type: 'saida', ip: '::1' },
    });
  });

  it.each([
    undefined,
    null,
    {},
    { email: 'ana@example.com', password: 'segredo' },
    { email: '', password: 'segredo', type: 'entrada' },
    { email: 'ana@example.com', password: '', type: 'entrada' },
    { email: 'ana@example.com', password: 'segredo', type: '' },
  ])('recusa corpo incompleto: %j', (body) => {
    expect(service.punch(body, '127.0.0.1')).toEqual({
      error: 'Dados insuficientes.',
    });
    expect(service.report('ana@example.com')).toEqual([]);
  });

  it('lista só o e-mail pedido, na ordem em que os pontos foram gravados', () => {
    service.punch(
      { email: 'ana@example.com', password: 'segredo', type: 'entrada' },
      '127.0.0.1',
    );
    service.punch(
      { email: 'bia@example.com', password: 'segredo', type: 'entrada' },
      '127.0.0.1',
    );
    service.punch(
      { email: 'ana@example.com', password: 'segredo', type: 'saida' },
      '127.0.0.1',
    );

    const history = service.report('ana@example.com');
    expect(history.map((entry) => entry.type)).toEqual(['entrada', 'saida']);
    expect(service.report('bia@example.com')).toHaveLength(1);
    expect(service.report('Ana@example.com')).toEqual([]);
  });

  it('grava a string "undefined" quando não há IP, como o servidor anterior', () => {
    const result = service.punch(
      { email: 'ana@example.com', password: 'segredo', type: 'entrada' },
      undefined,
    );
    expect(result).toMatchObject({ data: { ip: 'undefined' } });
  });
});
