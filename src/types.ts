export interface Tarefa {
  id: number;
  titulo: string;
  concluida: boolean;
  criada_em: Date;
}

export interface DadosTarefa {
  titulo?: string;
  concluida?: boolean;
}

/** Contrato do repositório de tarefas (implementado sobre PostgreSQL). */
export interface RepositorioTarefas {
  listar(): Promise<Tarefa[]>;
  buscarPorId(id: number): Promise<Tarefa | null>;
  criar(dados: { titulo: string }): Promise<Tarefa>;
  atualizar(id: number, dados: DadosTarefa): Promise<Tarefa | null>;
  remover(id: number): Promise<boolean>;
}
