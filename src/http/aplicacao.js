import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lerCorpoJson } from './corpo.js';
import { lerArquivoEstatico } from './arquivosEstaticos.js';
import { ErroAplicacaoHttp } from './erroHttp.js';

const PUBLIC_PADRAO = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../public',
);
const ROTA_PESSOA = /^\/pessoas\/([^/]+)$/;

function responderJson(res, status, dados, cabecalhos = {}) {
  const corpo = dados === undefined ? '' : JSON.stringify(dados);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    ...cabecalhos,
  });
  res.end(corpo);
}

function responderSemCorpo(res, status) {
  res.writeHead(status);
  res.end();
}

function exigirMetodo(req, permitidos) {
  if (!permitidos.includes(req.method)) {
    throw new ErroAplicacaoHttp(405, 'Método não permitido', {
      Allow: permitidos.join(', '),
    });
  }
}

/** Trata as rotas da API. Retorna false quando o caminho não pertence à API. */
async function tratarApi(req, res, caminho, servico) {
  if (caminho === '/saude') {
    exigirMetodo(req, ['GET']);
    responderJson(res, 200, { status: 'ok' });
    return true;
  }

  if (caminho === '/pessoas') {
    exigirMetodo(req, ['GET', 'POST']);
    if (req.method === 'GET') {
      responderJson(res, 200, servico.listar());
    } else {
      const pessoa = servico.criar(await lerCorpoJson(req));
      responderJson(res, 201, pessoa, { Location: `/pessoas/${pessoa.cpf}` });
    }
    return true;
  }

  const rotaPessoa = ROTA_PESSOA.exec(caminho);
  if (rotaPessoa) {
    const cpf = decodeURIComponent(rotaPessoa[1]);
    exigirMetodo(req, ['GET', 'PUT', 'DELETE']);
    if (req.method === 'GET') {
      responderJson(res, 200, servico.buscar(cpf));
    } else if (req.method === 'PUT') {
      responderJson(res, 200, servico.atualizar(cpf, await lerCorpoJson(req)));
    } else {
      servico.remover(cpf);
      responderSemCorpo(res, 204);
    }
    return true;
  }

  return false;
}

async function tratarRequisicao(req, res, { servico, diretorioPublico }) {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (await tratarApi(req, res, pathname, servico)) {
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    const arquivo = await lerArquivoEstatico(diretorioPublico, pathname);
    if (arquivo) {
      res.writeHead(200, {
        'Content-Type': arquivo.tipo,
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(req.method === 'HEAD' ? undefined : arquivo.corpo);
      return;
    }
  }

  throw new ErroAplicacaoHttp(404, 'Rota não encontrada');
}

/** Cria o servidor HTTP (sem iniciá-lo). Uso: criarAplicacao({ servico }).listen(porta). */
export function criarAplicacao({ servico, diretorioPublico = PUBLIC_PADRAO }) {
  return http.createServer((req, res) => {
    tratarRequisicao(req, res, { servico, diretorioPublico }).catch((erro) => {
      if (res.headersSent) {
        res.destroy();
        return;
      }
      if (typeof erro.status === 'number') {
        responderJson(res, erro.status, { erro: erro.message }, erro.cabecalhos);
        return;
      }
      console.error(erro);
      responderJson(res, 500, { erro: 'Erro interno do servidor' });
    });
  });
}
