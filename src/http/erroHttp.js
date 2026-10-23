/** Erro de protocolo HTTP (JSON inválido, corpo grande, rota inexistente...). */
export class ErroAplicacaoHttp extends Error {
  constructor(status, mensagem, cabecalhos = {}) {
    super(mensagem);
    this.name = 'ErroAplicacaoHttp';
    this.status = status;
    this.cabecalhos = cabecalhos;
  }
}
