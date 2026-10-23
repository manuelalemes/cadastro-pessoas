/** Armazenamento em memória, indexado pelo CPF (somente dígitos). */
export class RepositorioMemoria {
  #registros = new Map();

  salvar(pessoa) {
    this.#registros.set(pessoa.cpf, { ...pessoa });
    return { ...pessoa };
  }

  buscar(cpf) {
    const registro = this.#registros.get(cpf);
    return registro ? { ...registro } : undefined;
  }

  existe(cpf) {
    return this.#registros.has(cpf);
  }

  listar() {
    return [...this.#registros.values()]
      .map((registro) => ({ ...registro }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  remover(cpf) {
    return this.#registros.delete(cpf);
  }
}
