import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import type { RepositorioTarefas } from './types';
import { parseId, validarTarefa } from './validation';

/**
 * Cria a aplicação Express. O repositório é injetado para permitir
 * testes unitários (repositório falso) e de integração (PostgreSQL real).
 */
export function criarApp(repo: RepositorioTarefas): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.get('/tarefas', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await repo.listar());
    } catch (err) {
      next(err);
    }
  });

  app.get('/tarefas/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      if (id === null) return void res.status(400).json({ erro: 'id inválido' });
      const tarefa = await repo.buscarPorId(id);
      if (!tarefa) return void res.status(404).json({ erro: 'tarefa não encontrada' });
      res.json(tarefa);
    } catch (err) {
      next(err);
    }
  });

  app.post('/tarefas', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { valido, erros, dados } = validarTarefa(req.body);
      if (!valido) return void res.status(400).json({ erros });
      const criada = await repo.criar({ titulo: dados.titulo as string });
      res.status(201).json(criada);
    } catch (err) {
      next(err);
    }
  });

  app.patch('/tarefas/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      if (id === null) return void res.status(400).json({ erro: 'id inválido' });
      const { valido, erros, dados } = validarTarefa(req.body, { parcial: true });
      if (!valido) return void res.status(400).json({ erros });
      const atualizada = await repo.atualizar(id, dados);
      if (!atualizada) return void res.status(404).json({ erro: 'tarefa não encontrada' });
      res.json(atualizada);
    } catch (err) {
      next(err);
    }
  });

  app.delete('/tarefas/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      if (id === null) return void res.status(400).json({ erro: 'id inválido' });
      const removida = await repo.remover(id);
      if (!removida) return void res.status(404).json({ erro: 'tarefa não encontrada' });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ erro: 'rota não encontrada' });
  });

  app.use((err: Error & { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    if (err.type === 'entity.parse.failed') {
      res.status(400).json({ erro: 'JSON inválido' });
      return;
    }
    console.error(err);
    res.status(500).json({ erro: 'erro interno do servidor' });
  });

  return app;
}
