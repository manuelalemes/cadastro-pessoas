import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidorDeTeste } from '../helpers/servidorDeTeste.js';

describe('Arquivos estáticos do frontend (integração)', () => {
  let api;

  before(async () => {
    api = await iniciarServidorDeTeste();
  });

  after(() => api.encerrar());

  it('serve a página inicial em "/"', async () => {
    const { status, texto, cabecalhos } = await api.requisitar('GET', '/');
    assert.equal(status, 200);
    assert.match(cabecalhos.get('content-type'), /text\/html/);
    assert.match(texto, /Cadastro de Pessoas/);
    assert.match(texto, /id="form-pessoa"/);
  });

  it('serve o CSS com o content-type correto', async () => {
    const { status, cabecalhos } = await api.requisitar('GET', '/estilo.css');
    assert.equal(status, 200);
    assert.match(cabecalhos.get('content-type'), /text\/css/);
  });

  it('serve os módulos JavaScript do frontend', async () => {
    for (const arquivo of ['/app.js', '/mascara.js']) {
      const { status, cabecalhos } = await api.requisitar('GET', arquivo);
      assert.equal(status, 200, arquivo);
      assert.match(cabecalhos.get('content-type'), /text\/javascript/);
    }
  });

  it('bloqueia tentativa de sair da pasta public (path traversal)', async () => {
    const { status } = await api.requisitar('GET', '/..%2Fpackage.json');
    assert.ok([400, 403, 404].includes(status), `status inesperado: ${status}`);
    const { texto } = await api.requisitar('GET', '/..%2Fpackage.json');
    assert.doesNotMatch(texto, /cadastro-pessoas/);
  });

  it('responde 404 para arquivo inexistente', async () => {
    const { status } = await api.requisitar('GET', '/nada.png');
    assert.equal(status, 404);
  });
});
