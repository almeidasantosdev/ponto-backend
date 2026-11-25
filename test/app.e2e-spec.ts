import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

const ALLOWED_ORIGIN = 'https://seu-projeto-ponto.vercel.app';

describe('API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.ALLOWED_ORIGIN = ALLOWED_ORIGIN;
    process.env.AUTHORIZED_IPS = '127.0.0.1,::1';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health responde ok', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('envia o CORS da origem configurada, sem refletir outra origem', async () => {
    const allowed = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', ALLOWED_ORIGIN)
      .expect(200);

    expect(allowed.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    expect(allowed.headers['access-control-allow-credentials']).toBe('true');

    const blocked = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'https://outro.example')
      .expect(200);

    expect(blocked.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    expect(blocked.headers['access-control-allow-origin']).not.toBe(
      'https://outro.example',
    );
  });

  it('responde o preflight de POST /punch sem exigir o IP', async () => {
    const response = await request(app.getHttpServer())
      .options('/punch')
      .set('Origin', ALLOWED_ORIGIN)
      .set('Access-Control-Request-Method', 'POST');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    expect(response.headers['access-control-allow-methods']).toEqual(
      expect.stringContaining('POST'),
    );
  });

  it('POST /punch sem dados responde 400', async () => {
    await request(app.getHttpServer())
      .post('/punch')
      .set('x-forwarded-for', '127.0.0.1')
      .send({})
      .expect(400)
      .expect({ error: 'Dados insuficientes.' });
  });

  it('POST /punch de IP fora da lista responde 403 e não grava o ponto', async () => {
    await request(app.getHttpServer())
      .post('/punch')
      .set('x-forwarded-for', '203.0.113.10, 127.0.0.1')
      .send({
        email: 'bloqueado@example.com',
        password: 'segredo',
        type: 'entrada',
      })
      .expect(403)
      .expect({
        error: 'Acesso negado. Este dispositivo não está na rede autorizada.',
      });

    await request(app.getHttpServer())
      .get('/report/bloqueado@example.com')
      .expect(200)
      .expect([]);
  });

  it('registra entrada e saída e devolve o histórico daquele e-mail', async () => {
    const email = 'ana@example.com';
    const before = Date.now();

    const punch = await request(app.getHttpServer())
      .post('/punch')
      .set('Origin', ALLOWED_ORIGIN)
      .set('x-forwarded-for', '127.0.0.1, 10.0.0.4')
      .send({
        email,
        password: 'segredo',
        type: 'entrada',
        timestamp: '1999-01-01T00:00:00.000Z',
        ip: '9.9.9.9',
      })
      .expect(201);

    expect(punch.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    expect(punch.body.message).toBe('Ponto de entrada batido com sucesso!');
    expect(punch.body.data.email).toBe(email);
    expect(punch.body.data.type).toBe('entrada');
    expect(punch.body.data.ip).toBe('127.0.0.1');
    expect(punch.body.data.password).toBeUndefined();
    expect(JSON.stringify(punch.body)).not.toContain('segredo');
    expect(new Date(punch.body.data.timestamp).getTime()).toBeGreaterThanOrEqual(
      before,
    );

    await request(app.getHttpServer())
      .post('/punch')
      .set('x-forwarded-for', '::1')
      .send({ email, password: 'segredo', type: 'saida' })
      .expect(201)
      .expect((response) => {
        expect(response.body.message).toBe('Ponto de saida batido com sucesso!');
      });

    await request(app.getHttpServer())
      .post('/punch')
      .set('x-forwarded-for', '127.0.0.1')
      .send({
        email: 'bia@example.com',
        password: 'segredo',
        type: 'entrada',
      })
      .expect(201);

    const report = await request(app.getHttpServer())
      .get(`/report/${email}`)
      .expect(200);

    expect(report.body).toEqual([
      expect.objectContaining({
        email,
        type: 'entrada',
        ip: '127.0.0.1',
      }),
      expect.objectContaining({
        email,
        type: 'saida',
        ip: '::1',
      }),
    ]);
    expect(report.body[0].password).toBeUndefined();

    await request(app.getHttpServer())
      .get('/report/ninguem@example.com')
      .expect(200)
      .expect([]);
  });

  it('GET /report não exige IP autorizado', async () => {
    await request(app.getHttpServer())
      .get('/report/ana@example.com')
      .set('x-forwarded-for', '203.0.113.50')
      .expect(200);
  });
});
