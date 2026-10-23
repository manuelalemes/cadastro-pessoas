import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RepositorioMemoria } from '../../src/repositorio/repositorioMemoria.js';

describe('RepositorioMemoria', () => {
  let repo;
  const ana = { cpf: '52998224725', nome: 'Ana', dataNascimento: '1990-01-01' };
  const bia = { cpf: '11144477735', nome: 'Bia', dataNascimento: '1985-06-15' };

  beforeEach(() => {
    repo = new RepositorioMemoria();
  });

  it('começa vazio', () => {
    assert.deepEqual(repo.listar(), []);
  });

  it('salva e busca por CPF', () => {
    repo.salvar(ana);
    assert.deepEqual(repo.buscar(ana.cpf), ana);
    assert.equal(repo.existe(ana.cpf), true);
  });

  it('devolve undefined quando o CPF não existe', () => {
    assert.equal(repo.buscar('00000000000'), undefined);
    assert.equal(repo.existe('00000000000'), false);
  });

  it('lista em ordem alfabética de nome', () => {
    repo.salvar(bia);
    repo.salvar(ana);
    assert.deepEqual(
      repo.listar().map((p) => p.nome),
      ['Ana', 'Bia'],
    );
  });

  it('salvar com o mesmo CPF substitui o registro', () => {
    repo.salvar(ana);
    repo.salvar({ ...ana, nome: 'Ana Maria' });
    assert.equal(repo.listar().length, 1);
    assert.equal(repo.buscar(ana.cpf).nome, 'Ana Maria');
  });

  it('não expõe o objeto interno (alterar a cópia não afeta o repositório)', () => {
    repo.salvar(ana);
    repo.buscar(ana.cpf).nome = 'Alterado';
    repo.listar()[0].nome = 'Alterado';
    assert.equal(repo.buscar(ana.cpf).nome, 'Ana');
  });

  it('remove e informa se algo foi removido', () => {
    repo.salvar(ana);
    assert.equal(repo.remover(ana.cpf), true);
    assert.equal(repo.remover(ana.cpf), false);
    assert.deepEqual(repo.listar(), []);
  });
});
