import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ServicoPessoas } from '../../src/servico/servicoPessoas.js';
import { RepositorioMemoria } from '../../src/repositorio/repositorioMemoria.js';
import { ErroConflito, ErroNaoEncontrado, ErroValidacao } from '../../src/erros.js';

const CPF_ANA = '52998224725';
const CPF_BIA = '11144477735';

describe('ServicoPessoas', () => {
  let servico;

  beforeEach(() => {
    // Relógio fixo: 23/10/2026
    servico = new ServicoPessoas({
      repositorio: new RepositorioMemoria(),
      agora: () => new Date(2026, 9, 23),
    });
  });

  describe('criar', () => {
    it('cadastra e devolve a pessoa com a idade calculada', () => {
      const pessoa = servico.criar({
        cpf: CPF_ANA,
        nome: 'Ana Souza',
        dataNascimento: '2000-05-10',
      });
      assert.deepEqual(pessoa, {
        cpf: CPF_ANA,
        nome: 'Ana Souza',
        dataNascimento: '2000-05-10',
        idade: 26,
      });
    });

    it('aceita CPF com máscara e guarda somente os dígitos', () => {
      const pessoa = servico.criar({
        cpf: '529.982.247-25',
        nome: 'Ana',
        dataNascimento: '2000-05-10',
      });
      assert.equal(pessoa.cpf, CPF_ANA);
    });

    it('remove espaços extras do nome', () => {
      const pessoa = servico.criar({
        cpf: CPF_ANA,
        nome: '  Ana   Souza ',
        dataNascimento: '2000-05-10',
      });
      assert.equal(pessoa.nome, 'Ana Souza');
    });

    it('rejeita CPF inválido', () => {
      assert.throws(
        () => servico.criar({ cpf: '12345678900', nome: 'Ana', dataNascimento: '2000-05-10' }),
        { name: 'ErroValidacao', message: 'CPF inválido' },
      );
    });

    it('rejeita nome vazio, curto, longo ou que não seja texto', () => {
      for (const nome of ['', '   ', 'A', 'x'.repeat(121), 123, undefined]) {
        assert.throws(
          () => servico.criar({ cpf: CPF_ANA, nome, dataNascimento: '2000-05-10' }),
          ErroValidacao,
          `nome ${JSON.stringify(nome)} deveria ser rejeitado`,
        );
      }
    });

    it('rejeita data de nascimento inválida ou futura', () => {
      for (const dataNascimento of ['2000-02-30', '2030-01-01', undefined]) {
        assert.throws(
          () => servico.criar({ cpf: CPF_ANA, nome: 'Ana', dataNascimento }),
          ErroValidacao,
        );
      }
    });

    it('rejeita corpo ausente', () => {
      assert.throws(() => servico.criar(undefined), ErroValidacao);
    });

    it('rejeita CPF duplicado com ErroConflito', () => {
      const dados = { cpf: CPF_ANA, nome: 'Ana', dataNascimento: '2000-05-10' };
      servico.criar(dados);
      assert.throws(() => servico.criar({ ...dados, cpf: '529.982.247-25' }), ErroConflito);
    });
  });

  describe('listar e buscar', () => {
    beforeEach(() => {
      servico.criar({ cpf: CPF_BIA, nome: 'Bia', dataNascimento: '1985-12-31' });
      servico.criar({ cpf: CPF_ANA, nome: 'Ana', dataNascimento: '2000-05-10' });
    });

    it('lista todas as pessoas ordenadas por nome, com idade', () => {
      const lista = servico.listar();
      assert.deepEqual(
        lista.map((p) => [p.nome, p.idade]),
        [
          ['Ana', 26],
          ['Bia', 40],
        ],
      );
    });

    it('busca por CPF (com ou sem máscara)', () => {
      assert.equal(servico.buscar(CPF_ANA).nome, 'Ana');
      assert.equal(servico.buscar('529.982.247-25').nome, 'Ana');
    });

    it('lança ErroNaoEncontrado para CPF inexistente', () => {
      assert.throws(() => servico.buscar('00000000191'), ErroNaoEncontrado);
    });

    it('lança ErroValidacao para CPF malformado na busca', () => {
      assert.throws(() => servico.buscar('abc'), ErroValidacao);
    });
  });

  describe('atualizar', () => {
    beforeEach(() => {
      servico.criar({ cpf: CPF_ANA, nome: 'Ana', dataNascimento: '2000-05-10' });
    });

    it('altera nome e data de nascimento, recalculando a idade', () => {
      const pessoa = servico.atualizar(CPF_ANA, {
        nome: 'Ana Maria',
        dataNascimento: '1990-11-01',
      });
      assert.deepEqual(pessoa, {
        cpf: CPF_ANA,
        nome: 'Ana Maria',
        dataNascimento: '1990-11-01',
        idade: 35,
      });
      assert.equal(servico.buscar(CPF_ANA).nome, 'Ana Maria');
    });

    it('permite alterar apenas um dos campos', () => {
      const pessoa = servico.atualizar(CPF_ANA, { nome: 'Ana Paula' });
      assert.equal(pessoa.nome, 'Ana Paula');
      assert.equal(pessoa.dataNascimento, '2000-05-10');
    });

    it('não permite trocar o CPF', () => {
      assert.throws(() => servico.atualizar(CPF_ANA, { cpf: CPF_BIA, nome: 'Ana' }), {
        name: 'ErroValidacao',
        message: 'O CPF não pode ser alterado',
      });
    });

    it('aceita o mesmo CPF (mesmo com máscara) no corpo', () => {
      const pessoa = servico.atualizar(CPF_ANA, { cpf: '529.982.247-25', nome: 'Ana B' });
      assert.equal(pessoa.nome, 'Ana B');
    });

    it('valida os novos dados e não altera o registro em caso de erro', () => {
      assert.throws(() => servico.atualizar(CPF_ANA, { nome: '' }), ErroValidacao);
      assert.throws(() => servico.atualizar(CPF_ANA, { dataNascimento: '2999-01-01' }), ErroValidacao);
      assert.equal(servico.buscar(CPF_ANA).nome, 'Ana');
    });

    it('lança ErroNaoEncontrado para CPF inexistente', () => {
      assert.throws(() => servico.atualizar(CPF_BIA, { nome: 'Bia' }), ErroNaoEncontrado);
    });
  });

  describe('remover', () => {
    it('exclui a pessoa cadastrada', () => {
      servico.criar({ cpf: CPF_ANA, nome: 'Ana', dataNascimento: '2000-05-10' });
      servico.remover(CPF_ANA);
      assert.deepEqual(servico.listar(), []);
    });

    it('lança ErroNaoEncontrado quando não existe', () => {
      assert.throws(() => servico.remover(CPF_ANA), ErroNaoEncontrado);
    });
  });
});
