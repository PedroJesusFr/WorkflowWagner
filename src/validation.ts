import type { DadosTarefa } from './types';

export const MAX_TITULO = 120;

export interface ResultadoValidacao {
  valido: boolean;
  erros: string[];
  dados: DadosTarefa;
}

/**
 * Valida o corpo de uma requisição de criação/atualização de tarefa.
 * @param body corpo da requisição
 * @param opcoes parcial=true permite omitir campos (PATCH)
 */
export function validarTarefa(
  body: unknown,
  { parcial = false }: { parcial?: boolean } = {},
): ResultadoValidacao {
  const erros: string[] = [];
  const dados: DadosTarefa = {};
  const origem = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

  if (origem.titulo !== undefined || !parcial) {
    const titulo = origem.titulo;
    if (typeof titulo !== 'string' || titulo.trim() === '') {
      erros.push('titulo é obrigatório e deve ser um texto não vazio');
    } else if (titulo.trim().length > MAX_TITULO) {
      erros.push(`titulo deve ter no máximo ${MAX_TITULO} caracteres`);
    } else {
      dados.titulo = titulo.trim();
    }
  }

  if (origem.concluida !== undefined) {
    if (typeof origem.concluida !== 'boolean') {
      erros.push('concluida deve ser verdadeiro ou falso');
    } else {
      dados.concluida = origem.concluida;
    }
  }

  if (parcial && Object.keys(dados).length === 0 && erros.length === 0) {
    erros.push('informe ao menos um campo para atualizar');
  }

  return { valido: erros.length === 0, erros, dados };
}

/** Converte o parâmetro de rota em id inteiro positivo, ou null se inválido. */
export function parseId(valor: string): number | null {
  if (!/^[1-9]\d{0,9}$/.test(String(valor))) return null;
  return Number(valor);
}
