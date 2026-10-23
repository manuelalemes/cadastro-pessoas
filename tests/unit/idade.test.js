import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calcularIdade, validarDataNascimento } from '../../src/dominio/idade.js';
import { ErroValidacao } from '../../src/erros.js';

// Datas de referência sempre explícitas para o teste não depender do relógio.
const hoje = new Date(2026, 9, 23); // 23/10/2026

describe('calcularIdade', () => {
  it('conta anos completos quando o aniversário já passou no ano', () => {
    assert.equal(calcularIdade('2000-05-10', hoje), 26);
  });

  it('desconta um ano quando o aniversário ainda não chegou', () => {
    assert.equal(calcularIdade('2000-12-25', hoje), 25);
  });

  it('considera o próprio dia do aniversário como ano completo', () => {
    assert.equal(calcularIdade('2000-10-23', hoje), 26);
  });

  it('considera o dia anterior ao aniversário como ano incompleto', () => {
    assert.equal(calcularIdade('2000-10-24', hoje), 25);
  });

  it('retorna 0 para quem nasceu há menos de um ano', () => {
    assert.equal(calcularIdade('2026-03-01', hoje), 0);
  });

  it('retorna 0 para quem nasceu hoje', () => {
    assert.equal(calcularIdade('2026-10-23', hoje), 0);
  });

  it('completa 29/02 em 01/03 nos anos não bissextos', () => {
    assert.equal(calcularIdade('2000-02-29', new Date(2025, 1, 28)), 24);
    assert.equal(calcularIdade('2000-02-29', new Date(2025, 2, 1)), 25);
  });

  it('completa 29/02 no próprio dia nos anos bissextos', () => {
    assert.equal(calcularIdade('2000-02-29', new Date(2028, 1, 29)), 28);
  });

  it('usa a data atual quando nenhuma referência é informada', () => {
    const esperado = new Date().getFullYear() - 1990;
    const idade = calcularIdade('1990-01-01');
    assert.ok(idade === esperado || idade === esperado - 1);
  });
});

describe('validarDataNascimento', () => {
  const invalidas = [
    ['texto livre', 'ontem'],
    ['formato brasileiro', '10/05/2000'],
    ['sem zero à esquerda', '2000-5-1'],
    ['mês inexistente', '2000-13-01'],
    ['dia inexistente', '2000-02-30'],
    ['29/02 em ano não bissexto', '2023-02-29'],
    ['vazia', ''],
    ['nula', null],
    ['numérica', 20000510],
  ];

  for (const [descricao, valor] of invalidas) {
    it(`rejeita data ${descricao}`, () => {
      assert.throws(() => validarDataNascimento(valor, hoje), ErroValidacao);
    });
  }

  it('rejeita data no futuro', () => {
    assert.throws(() => validarDataNascimento('2026-10-24', hoje), {
      name: 'ErroValidacao',
      message: 'Data de nascimento não pode ser futura',
    });
  });

  it('rejeita idade irreal (mais de 150 anos)', () => {
    assert.throws(() => validarDataNascimento('1800-01-01', hoje), ErroValidacao);
  });

  it('aceita data válida e devolve o mesmo texto', () => {
    assert.equal(validarDataNascimento('2000-02-29', hoje), '2000-02-29');
  });
});
