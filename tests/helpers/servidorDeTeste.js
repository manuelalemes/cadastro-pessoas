import { criarAplicacao } from '../../src/http/aplicacao.js';
import { ServicoPessoas } from '../../src/servico/servicoPessoas.js';
import { RepositorioMemoria } from '../../src/repositorio/repositorioMemoria.js';

/** Sobe a aplicação real em uma porta livre e devolve um cliente HTTP simples. */
export async function iniciarServidorDeTeste() {
  const servico = new ServicoPessoas({
    repositorio: new RepositorioMemoria(),
    agora: () => new Date(2026, 9, 23),
  });
  const servidor = criarAplicacao({ servico });

  await new Promise((resolve) => servidor.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${servidor.address().port}`;

  async function requisitar(metodo, caminho, corpo, cabecalhos = {}) {
    const resposta = await fetch(base + caminho, {
      method: metodo,
      headers:
        corpo === undefined
          ? cabecalhos
          : { 'Content-Type': 'application/json', ...cabecalhos },
      body:
        typeof corpo === 'string' || corpo === undefined ? corpo : JSON.stringify(corpo),
    });
    const texto = await resposta.text();
    let json = null;
    try {
      json = JSON.parse(texto);
    } catch {
      // resposta não-JSON (HTML, CSS...) fica apenas em "texto"
    }
    return { status: resposta.status, cabecalhos: resposta.headers, texto, json };
  }

  return {
    requisitar,
    encerrar: () => new Promise((resolve) => servidor.close(resolve)),
  };
}
