import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ErroValidacao, ErroNaoEncontrado, ErroConflito } from '../../src/erros.js';

describe('erros de domínio', () => {
  it('ErroValidacao carrega mensagem e status 400', () => {
    const erro = new ErroValidacao('CPF inválido');
    assert.ok(erro instanceof Error);
    assert.equal(erro.message, 'CPF inválido');
    assert.equal(erro.status, 400);
    assert.equal(erro.name, 'ErroValidacao');
  });

  it('ErroNaoEncontrado usa status 404', () => {
    assert.equal(new ErroNaoEncontrado('Pessoa não encontrada').status, 404);
  });

  it('ErroConflito usa status 409', () => {
    assert.equal(new ErroConflito('CPF já cadastrado').status, 409);
  });
});
