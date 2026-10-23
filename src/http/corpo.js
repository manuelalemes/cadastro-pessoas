import { ErroAplicacaoHttp } from './erroHttp.js';

export const LIMITE_CORPO_BYTES = 100 * 1024;

/** Lê o corpo da requisição e converte de JSON. Corpo vazio vira undefined. */
export async function lerCorpoJson(req) {
  const pedacos = [];
  let total = 0;

  for await (const pedaco of req) {
    total += pedaco.length;
    if (total > LIMITE_CORPO_BYTES) {
      throw new ErroAplicacaoHttp(413, 'Corpo da requisição grande demais', {
        Connection: 'close',
      });
    }
    pedacos.push(pedaco);
  }

  const texto = Buffer.concat(pedacos).toString('utf8');
  if (texto.trim() === '') {
    return undefined;
  }

  try {
    return JSON.parse(texto);
  } catch {
    throw new ErroAplicacaoHttp(400, 'JSON inválido');
  }
}
