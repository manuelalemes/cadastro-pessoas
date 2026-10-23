import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { apenasDigitos, cpfValido, formatarCpf } from '../../src/dominio/cpf.js';

describe('apenasDigitos', () => {
  it('remove pontos, traço e espaços', () => {
    assert.equal(apenasDigitos(' 529.982.247-25 '), '52998224725');
  });

  it('devolve string vazia para valores que não são texto', () => {
    assert.equal(apenasDigitos(undefined), '');
    assert.equal(apenasDigitos(52998224725), '');
  });
});

describe('cpfValido', () => {
  const validos = ['52998224725', '529.982.247-25', '11144477735', '111.444.777-35'];
  for (const cpf of validos) {
    it(`aceita ${cpf}`, () => {
      assert.equal(cpfValido(cpf), true);
    });
  }

  it('rejeita primeiro dígito verificador incorreto', () => {
    assert.equal(cpfValido('52998224735'), false);
  });

  it('rejeita segundo dígito verificador incorreto', () => {
    assert.equal(cpfValido('52998224726'), false);
  });

  for (let d = 0; d <= 9; d++) {
    it(`rejeita sequência repetida ${String(d).repeat(11)}`, () => {
      assert.equal(cpfValido(String(d).repeat(11)), false);
    });
  }

  const malFormados = ['', '123', '1234567890', '123456789012', 'abcdefghijk', null, 12345678909];
  for (const cpf of malFormados) {
    it(`rejeita formato inválido (${JSON.stringify(cpf)})`, () => {
      assert.equal(cpfValido(cpf), false);
    });
  }
});

describe('formatarCpf', () => {
  it('aplica a máscara 000.000.000-00', () => {
    assert.equal(formatarCpf('52998224725'), '529.982.247-25');
  });

  it('mantém o valor original quando não há 11 dígitos', () => {
    assert.equal(formatarCpf('123'), '123');
  });
});
