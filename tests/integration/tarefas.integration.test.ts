// Teste de integração: API + repositório + PostgreSQL real.
// Requer a variável DATABASE_URL apontando para um banco de testes.
import type { Pool } from 'pg';
import request from 'supertest';
import { criarApp } from '../../src/app';
import { criarPool, inicializarSchema } from '../../src/db';
import { criarRepositorio } from '../../src/repository';

let pool: Pool;
let app: ReturnType<typeof criarApp>;

beforeAll(async () => {
  pool = criarPool();
  await inicializarSchema(pool);
  app = criarApp(criarRepositorio(pool));
});

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE tarefas RESTART IDENTITY');
});

afterAll(async () => {
  await pool.end();
});

describe('CRUD de tarefas com PostgreSQL', () => {
  test('cria e lista tarefas persistidas no banco', async () => {
    const criada = await request(app).post('/tarefas').send({ titulo: 'Configurar CI' });
    expect(criada.status).toBe(201);
    expect(criada.body).toMatchObject({ id: 1, titulo: 'Configurar CI', concluida: false });

    const lista = await request(app).get('/tarefas');
    expect(lista.status).toBe(200);
    expect(lista.body).toHaveLength(1);

    const { rows } = await pool.query('SELECT titulo FROM tarefas WHERE id = 1');
    expect(rows[0].titulo).toBe('Configurar CI');
  });

  test('busca por id existente e inexistente', async () => {
    await request(app).post('/tarefas').send({ titulo: 'Uma' });
    expect((await request(app).get('/tarefas/1')).status).toBe(200);
    expect((await request(app).get('/tarefas/999')).status).toBe(404);
  });

  test('atualiza parcialmente uma tarefa', async () => {
    await request(app).post('/tarefas').send({ titulo: 'Original' });
    const res = await request(app).patch('/tarefas/1').send({ concluida: true });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ titulo: 'Original', concluida: true });
  });

  test('remove uma tarefa', async () => {
    await request(app).post('/tarefas').send({ titulo: 'Apagar' });
    expect((await request(app).delete('/tarefas/1')).status).toBe(204);
    expect((await request(app).get('/tarefas/1')).status).toBe(404);
  });

  test('título malicioso é tratado como dado (consulta parametrizada)', async () => {
    const titulo = "x'); DROP TABLE tarefas; --";
    const res = await request(app).post('/tarefas').send({ titulo });
    expect(res.status).toBe(201);
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM tarefas');
    expect(rows[0].total).toBe(1);
  });

  test('rejeita título maior que o limite com 400', async () => {
    const res = await request(app)
      .post('/tarefas')
      .send({ titulo: 'a'.repeat(200) });
    expect(res.status).toBe(400);
  });
});
