import fs from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';

/** Cria o pool de conexões a partir da variável DATABASE_URL. */
export function criarPool(connectionString: string | undefined = process.env.DATABASE_URL): Pool {
  if (!connectionString) {
    throw new Error('DATABASE_URL não definida');
  }
  return new Pool({ connectionString });
}

/** Executa o script de criação das tabelas (idempotente). */
export async function inicializarSchema(pool: Pick<Pool, 'query'>): Promise<void> {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'init.sql'), 'utf8');
  await pool.query(sql);
}
