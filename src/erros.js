/** Erro base: toda falha prevista pela aplicação carrega o status HTTP correspondente. */
class ErroAplicacao extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.name = new.target.name;
    this.status = status;
  }
}

export class ErroValidacao extends ErroAplicacao {
  constructor(mensagem) {
    super(mensagem, 400);
  }
}

export class ErroNaoEncontrado extends ErroAplicacao {
  constructor(mensagem) {
    super(mensagem, 404);
  }
}

export class ErroConflito extends ErroAplicacao {
  constructor(mensagem) {
    super(mensagem, 409);
  }
}
