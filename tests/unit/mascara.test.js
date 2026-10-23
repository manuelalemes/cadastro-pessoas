import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dataParaBr, mascararCpf, textoIdade } from '../../public/mascara.js';

describe('mascararCpf (digitação progressiva)', () => {
  const casos = [
    ['', ''],
    ['5', '5'],
    ['529', '529'],
    ['5299', '529.9'],
    ['529982', '529.982'],
    ['5299822', '529.982.2'],
    ['529982247', '529.982.247'],
    ['5299822472', '529.982.247-2'],
    ['52998224725', '529.982.247-25'],
  ];
  for (const [entrada, esperado] of casos) {
    it(`"${entrada}" -> "${esperado}"`, () => {
      assert.equal(mascararCpf(entrada), esperado);
    });
  }

  it('ignora letras e símbolos digitados', () => {
    assert.equal(mascararCpf('5a2b9-9.8'), '529.98');
  });

  it('corta o que passar de 11 dígitos', () => {
    assert.equal(mascararCpf('5299822472599999'), '529.982.247-25');
  });

  it('reaplica a máscara sobre um valor já mascarado', () => {
    assert.equal(mascararCpf('529.982.247-25'), '529.982.247-25');
  });
});

describe('dataParaBr', () => {
  it('converte AAAA-MM-DD em DD/MM/AAAA', () => {
    assert.equal(dataParaBr('2000-05-10'), '10/05/2000');
  });

  it('devolve o texto original quando o formato não é reconhecido', () => {
    assert.equal(dataParaBr('amanhã'), 'amanhã');
  });
});

describe('textoIdade', () => {
  it('usa singular para 1 ano', () => {
    assert.equal(textoIdade(1), '1 ano');
  });

  it('usa plural para 0 e para mais de 1', () => {
    assert.equal(textoIdade(0), '0 anos');
    assert.equal(textoIdade(26), '26 anos');
  });
});
