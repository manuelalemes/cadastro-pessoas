import { readFile } from 'node:fs/promises';
import path from 'node:path';

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

/**
 * Devolve { corpo, tipo } do arquivo pedido dentro de `raiz`, ou null se não existir
 * ou se o caminho tentar escapar da pasta (ex.: "../package.json").
 */
export async function lerArquivoEstatico(raiz, caminhoUrl) {
  let relativo;
  try {
    relativo = decodeURIComponent(caminhoUrl);
  } catch {
    return null;
  }
  if (relativo.includes('\0')) {
    return null;
  }

  const pedido = relativo.endsWith('/') ? `${relativo}index.html` : relativo;
  const completo = path.resolve(raiz, `.${path.sep}${pedido}`);
  const dentroDaRaiz = completo.startsWith(path.resolve(raiz) + path.sep);

  if (!dentroDaRaiz || !(path.extname(completo) in TIPOS)) {
    return null;
  }

  try {
    return { corpo: await readFile(completo), tipo: TIPOS[path.extname(completo)] };
  } catch {
    return null;
  }
}
