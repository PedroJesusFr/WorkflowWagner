import { criarApp } from './app';
import { criarPool, inicializarSchema } from './db';
import { criarRepositorio } from './repository';

async function main(): Promise<void> {
  const pool = criarPool();
  await inicializarSchema(pool);
  const app = criarApp(criarRepositorio(pool));
  const porta = Number(process.env.PORT) || 3000;
  app.listen(porta, () => console.log(`API ouvindo na porta ${porta}`));
}

main().catch((err: Error) => {
  console.error('Falha ao iniciar a aplicação:', err.message);
  process.exit(1);
});
