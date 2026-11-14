import request from 'supertest';
import { criarApp } from '../../src/app';
import type { RepositorioTarefas, Tarefa } from '../../src/types';

function repoFalso(): jest.Mocked<RepositorioTarefas> {
  const tarefas: Tarefa[] = [];
  let seq = 1;
  return {
    listar: jest.fn(async () => tarefas),
    buscarPorId: jest.fn(async (id: number) => tarefas.find((t) => t.id === id) ?? null),
    criar: jest.fn(async ({ titulo }) => {
      const t: Tarefa = { id: seq++, titulo, concluida: false, criada_em: new Date() };
      tarefas.push(t);
      return t;
    }),
    atualizar: jest.fn(async (id: number, dados) => {
      const t = tarefas.find((x) => x.id === id);
      return t ? Object.assign(t, dados) : null;
    }),
    remover: jest.fn(async (id: number) => {
      const i = tarefas.findIndex((t) => t.id === id);
      if (i < 0) return false;
      tarefas.splice(i, 1);
      return true;
    }),
  };
}

describe('API (repositório simulado)', () => {
  let repo: jest.Mocked<RepositorioTarefas>;
  let app: ReturnType<typeof criarApp>;

  beforeEach(() => {
    repo = repoFalso();
    app = criarApp(repo);
  });

  test('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('POST /tarefas cria tarefa válida', async () => {
    const res = await request(app).post('/tarefas').send({ titulo: 'Teste' });
    expect(res.status).toBe(201);
    expect(res.body.titulo).toBe('Teste');
    expect(repo.criar).toHaveBeenCalledWith({ titulo: 'Teste' });
  });

  test('POST /tarefas com dados inválidos retorna 400 sem chamar o repositório', async () => {
    const res = await request(app).post('/tarefas').send({ titulo: '' });
    expect(res.status).toBe(400);
    expect(repo.criar).not.toHaveBeenCalled();
  });

  test('POST /tarefas com JSON malformado retorna 400', async () => {
    const res = await request(app)
      .post('/tarefas')
      .set('Content-Type', 'application/json')
      .send('{ruim');
    expect(res.status).toBe(400);
  });

  test('GET /tarefas lista as tarefas', async () => {
    await request(app).post('/tarefas').send({ titulo: 'A' });
    const res = await request(app).get('/tarefas');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('GET /tarefas/:id inexistente retorna 404', async () => {
    const res = await request(app).get('/tarefas/99');
    expect(res.status).toBe(404);
  });

  test('GET /tarefas/:id inválido retorna 400', async () => {
    const res = await request(app).get('/tarefas/abc');
    expect(res.status).toBe(400);
  });

  test('PATCH atualiza e DELETE remove', async () => {
    await request(app).post('/tarefas').send({ titulo: 'A' });
    const patch = await request(app).patch('/tarefas/1').send({ concluida: true });
    expect(patch.status).toBe(200);
    expect(patch.body.concluida).toBe(true);
    const del = await request(app).delete('/tarefas/1');
    expect(del.status).toBe(204);
    const nova = await request(app).delete('/tarefas/1');
    expect(nova.status).toBe(404);
  });

  test('erro do repositório retorna 500 sem vazar detalhes', async () => {
    repo.listar.mockRejectedValueOnce(new Error('segredo do banco'));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await request(app).get('/tarefas');
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('segredo');
    spy.mockRestore();
  });

  test('rota desconhecida retorna 404', async () => {
    const res = await request(app).get('/nada');
    expect(res.status).toBe(404);
  });
});
