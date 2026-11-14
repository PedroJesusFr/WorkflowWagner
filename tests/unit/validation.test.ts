import { MAX_TITULO, parseId, validarTarefa } from '../../src/validation';

describe('validarTarefa', () => {
  test('aceita título válido e remove espaços', () => {
    const r = validarTarefa({ titulo: '  Estudar CI  ' });
    expect(r.valido).toBe(true);
    expect(r.dados).toEqual({ titulo: 'Estudar CI' });
  });

  test('rejeita título ausente, vazio ou não textual', () => {
    expect(validarTarefa({}).valido).toBe(false);
    expect(validarTarefa({ titulo: '   ' }).valido).toBe(false);
    expect(validarTarefa({ titulo: 123 }).valido).toBe(false);
    expect(validarTarefa(undefined).valido).toBe(false);
  });

  test('rejeita título maior que o limite', () => {
    const r = validarTarefa({ titulo: 'a'.repeat(MAX_TITULO + 1) });
    expect(r.valido).toBe(false);
  });

  test('valida o campo concluida', () => {
    expect(validarTarefa({ titulo: 'x', concluida: 'sim' }).valido).toBe(false);
    expect(validarTarefa({ titulo: 'x', concluida: true }).dados.concluida).toBe(true);
  });

  test('modo parcial exige ao menos um campo', () => {
    expect(validarTarefa({}, { parcial: true }).valido).toBe(false);
    expect(validarTarefa({ concluida: true }, { parcial: true }).valido).toBe(true);
  });
});

describe('parseId', () => {
  test('converte ids válidos', () => {
    expect(parseId('1')).toBe(1);
    expect(parseId('42')).toBe(42);
  });

  test('rejeita ids inválidos', () => {
    for (const v of ['0', '-1', 'abc', '1.5', '', '1; DROP TABLE tarefas']) {
      expect(parseId(v)).toBeNull();
    }
  });
});
