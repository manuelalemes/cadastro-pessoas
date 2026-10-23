import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidorDeTeste } from '../helpers/servidorDeTeste.js';

const ANA = { cpf: '52998224725', nome: 'Ana Souza', dataNascimento: '2000-05-10' };
const BIA = { cpf: '11144477735', nome: 'Bia Lima', dataNascimento: '1985-12-31' };

describe('API /pessoas (integração)', () => {
  let api;

  before(async () => {
    api = await iniciarServidorDeTeste();
  });

  after(() => api.encerrar());

  beforeEach(async () => {
    // Estado limpo: remove tudo o que existir antes de cada teste
    const { json } = await api.requisitar('GET', '/pessoas');
    for (const pessoa of json) {
      await api.requisitar('DELETE', `/pessoas/${pessoa.cpf}`);
    }
  });

  it('GET /saude responde ok', async () => {
    const { status, json } = await api.requisitar('GET', '/saude');
    assert.equal(status, 200);
    assert.deepEqual(json, { status: 'ok' });
  });

  describe('POST /pessoas', () => {
    it('cria a pessoa e devolve 201 com a idade', async () => {
      const { status, json } = await api.requisitar('POST', '/pessoas', ANA);
      assert.equal(status, 201);
      assert.deepEqual(json, { ...ANA, idade: 26 });
    });

    it('informa a URL do novo recurso no cabeçalho Location', async () => {
      const { cabecalhos } = await api.requisitar('POST', '/pessoas', ANA);
      assert.equal(cabecalhos.get('location'), `/pessoas/${ANA.cpf}`);
    });

    it('responde 400 para CPF inválido', async () => {
      const { status, json } = await api.requisitar('POST', '/pessoas', {
        ...ANA,
        cpf: '11111111111',
      });
      assert.equal(status, 400);
      assert.equal(json.erro, 'CPF inválido');
    });

    it('responde 400 para data futura', async () => {
      const { status, json } = await api.requisitar('POST', '/pessoas', {
        ...ANA,
        dataNascimento: '2027-01-01',
      });
      assert.equal(status, 400);
      assert.match(json.erro, /futura/);
    });

    it('responde 409 para CPF repetido', async () => {
      await api.requisitar('POST', '/pessoas', ANA);
      const { status, json } = await api.requisitar('POST', '/pessoas', ANA);
      assert.equal(status, 409);
      assert.equal(json.erro, 'CPF já cadastrado');
    });

    it('responde 400 para JSON malformado', async () => {
      const { status, json } = await api.requisitar('POST', '/pessoas', '{quebrado');
      assert.equal(status, 400);
      assert.equal(json.erro, 'JSON inválido');
    });

    it('responde 400 quando o corpo não é um objeto', async () => {
      const { status } = await api.requisitar('POST', '/pessoas', '[1,2]');
      assert.equal(status, 400);
    });

    it('responde 413 para corpo grande demais', async () => {
      const { status } = await api.requisitar('POST', '/pessoas', {
        ...ANA,
        nome: 'x'.repeat(200_000),
      });
      assert.equal(status, 413);
    });
  });

  describe('GET /pessoas', () => {
    it('lista vazia no início', async () => {
      const { status, json } = await api.requisitar('GET', '/pessoas');
      assert.equal(status, 200);
      assert.deepEqual(json, []);
    });

    it('lista as pessoas cadastradas em ordem de nome', async () => {
      await api.requisitar('POST', '/pessoas', BIA);
      await api.requisitar('POST', '/pessoas', ANA);
      const { json } = await api.requisitar('GET', '/pessoas');
      assert.deepEqual(
        json.map((p) => p.nome),
        ['Ana Souza', 'Bia Lima'],
      );
    });
  });

  describe('GET /pessoas/:cpf', () => {
    it('devolve a pessoa pelo CPF', async () => {
      await api.requisitar('POST', '/pessoas', ANA);
      const { status, json } = await api.requisitar('GET', `/pessoas/${ANA.cpf}`);
      assert.equal(status, 200);
      assert.equal(json.nome, 'Ana Souza');
    });

    it('responde 404 quando não existe', async () => {
      const { status, json } = await api.requisitar('GET', `/pessoas/${ANA.cpf}`);
      assert.equal(status, 404);
      assert.equal(json.erro, 'Pessoa não encontrada');
    });

    it('responde 400 para CPF malformado', async () => {
      const { status } = await api.requisitar('GET', '/pessoas/abc');
      assert.equal(status, 400);
    });
  });

  describe('PUT /pessoas/:cpf', () => {
    it('atualiza nome e data e recalcula a idade', async () => {
      await api.requisitar('POST', '/pessoas', ANA);
      const { status, json } = await api.requisitar('PUT', `/pessoas/${ANA.cpf}`, {
        nome: 'Ana Maria',
        dataNascimento: '1990-11-01',
      });
      assert.equal(status, 200);
      assert.deepEqual(json, {
        cpf: ANA.cpf,
        nome: 'Ana Maria',
        dataNascimento: '1990-11-01',
        idade: 35,
      });
    });

    it('persiste a alteração', async () => {
      await api.requisitar('POST', '/pessoas', ANA);
      await api.requisitar('PUT', `/pessoas/${ANA.cpf}`, { nome: 'Outro Nome' });
      const { json } = await api.requisitar('GET', `/pessoas/${ANA.cpf}`);
      assert.equal(json.nome, 'Outro Nome');
    });

    it('responde 400 ao tentar trocar o CPF', async () => {
      await api.requisitar('POST', '/pessoas', ANA);
      const { status } = await api.requisitar('PUT', `/pessoas/${ANA.cpf}`, {
        cpf: BIA.cpf,
      });
      assert.equal(status, 400);
    });

    it('responde 404 para pessoa inexistente', async () => {
      const { status } = await api.requisitar('PUT', `/pessoas/${ANA.cpf}`, {
        nome: 'Ana',
      });
      assert.equal(status, 404);
    });
  });

  describe('DELETE /pessoas/:cpf', () => {
    it('remove e responde 204 sem corpo', async () => {
      await api.requisitar('POST', '/pessoas', ANA);
      const { status, texto } = await api.requisitar('DELETE', `/pessoas/${ANA.cpf}`);
      assert.equal(status, 204);
      assert.equal(texto, '');
      const consulta = await api.requisitar('GET', `/pessoas/${ANA.cpf}`);
      assert.equal(consulta.status, 404);
    });

    it('responde 404 para pessoa inexistente', async () => {
      const { status } = await api.requisitar('DELETE', `/pessoas/${ANA.cpf}`);
      assert.equal(status, 404);
    });
  });

  describe('roteamento', () => {
    it('responde 404 em JSON para rotas desconhecidas', async () => {
      const { status, json } = await api.requisitar('GET', '/nao-existe');
      assert.equal(status, 404);
      assert.equal(json.erro, 'Rota não encontrada');
    });

    it('responde 405 para método não suportado em /pessoas', async () => {
      const { status, cabecalhos } = await api.requisitar('PATCH', '/pessoas', {});
      assert.equal(status, 405);
      assert.equal(cabecalhos.get('allow'), 'GET, POST');
    });
  });
});
