import type { Pool } from 'pg';
import type { DadosTarefa, RepositorioTarefas, Tarefa } from './types';

/**
 * Repositório de tarefas sobre PostgreSQL.
 * Todas as consultas são parametrizadas (previne SQL Injection).
 */
export function criarRepositorio(pool: Pick<Pool, 'query'>): RepositorioTarefas {
  return {
    async listar() {
      const { rows } = await pool.query<Tarefa>(
        'SELECT id, titulo, concluida, criada_em FROM tarefas ORDER BY id',
      );
      return rows;
    },

    async buscarPorId(id: number) {
      const { rows } = await pool.query<Tarefa>(
        'SELECT id, titulo, concluida, criada_em FROM tarefas WHERE id = $1',
        [id],
      );
      return rows[0] ?? null;
    },

    async criar({ titulo }) {
      const { rows } = await pool.query<Tarefa>(
        'INSERT INTO tarefas (titulo) VALUES ($1) RETURNING id, titulo, concluida, criada_em',
        [titulo],
      );
      return rows[0];
    },

    async atualizar(id: number, { titulo, concluida }: DadosTarefa) {
      const { rows } = await pool.query<Tarefa>(
        `UPDATE tarefas
            SET titulo = COALESCE($2, titulo),
                concluida = COALESCE($3, concluida)
          WHERE id = $1
      RETURNING id, titulo, concluida, criada_em`,
        [id, titulo ?? null, concluida ?? null],
      );
      return rows[0] ?? null;
    },

    async remover(id: number) {
      const { rowCount } = await pool.query('DELETE FROM tarefas WHERE id = $1', [id]);
      return (rowCount ?? 0) > 0;
    },
  };
}
