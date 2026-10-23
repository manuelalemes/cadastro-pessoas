import { apenasDigitos, cpfValido } from '../dominio/cpf.js';
import { calcularIdade, validarDataNascimento } from '../dominio/idade.js';
import { ErroConflito, ErroNaoEncontrado, ErroValidacao } from '../erros.js';

const NOME_MINIMO = 2;
const NOME_MAXIMO = 120;

function normalizarNome(nome) {
  if (typeof nome !== 'string') {
    throw new ErroValidacao('Nome inválido');
  }
  const limpo = nome.trim().replace(/\s+/g, ' ');
  if (limpo.length < NOME_MINIMO || limpo.length > NOME_MAXIMO) {
    throw new ErroValidacao(
      `Nome deve ter entre ${NOME_MINIMO} e ${NOME_MAXIMO} caracteres`,
    );
  }
  return limpo;
}

function normalizarCpf(cpf) {
  if (!cpfValido(cpf)) {
    throw new ErroValidacao('CPF inválido');
  }
  return apenasDigitos(cpf);
}

function exigirObjeto(dados) {
  if (dados === null || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new ErroValidacao('Corpo da requisição inválido');
  }
  return dados;
}

/** Regras de negócio do CRUD. O armazenamento e o relógio são injetados (facilita testar). */
export class ServicoPessoas {
  #repositorio;
  #agora;

  constructor({ repositorio, agora = () => new Date() }) {
    this.#repositorio = repositorio;
    this.#agora = agora;
  }

  criar(dados) {
    const { cpf, nome, dataNascimento } = exigirObjeto(dados);
    const pessoa = {
      cpf: normalizarCpf(cpf),
      nome: normalizarNome(nome),
      dataNascimento: validarDataNascimento(dataNascimento, this.#agora()),
    };

    if (this.#repositorio.existe(pessoa.cpf)) {
      throw new ErroConflito('CPF já cadastrado');
    }
    return this.#apresentar(this.#repositorio.salvar(pessoa));
  }

  listar() {
    return this.#repositorio.listar().map((pessoa) => this.#apresentar(pessoa));
  }

  buscar(cpf) {
    return this.#apresentar(this.#obrigatoria(cpf));
  }

  atualizar(cpf, dados) {
    const atual = this.#obrigatoria(cpf);
    const { cpf: cpfDoCorpo, ...campos } = exigirObjeto(dados);

    if (cpfDoCorpo !== undefined && normalizarCpf(cpfDoCorpo) !== atual.cpf) {
      throw new ErroValidacao('O CPF não pode ser alterado');
    }

    const nova = {
      cpf: atual.cpf,
      nome: normalizarNome(campos.nome ?? atual.nome),
      dataNascimento: validarDataNascimento(
        campos.dataNascimento ?? atual.dataNascimento,
        this.#agora(),
      ),
    };
    return this.#apresentar(this.#repositorio.salvar(nova));
  }

  remover(cpf) {
    this.#repositorio.remover(this.#obrigatoria(cpf).cpf);
  }

  #obrigatoria(cpf) {
    const digitos = apenasDigitos(cpf);
    if (!cpfValido(digitos)) {
      throw new ErroValidacao('CPF inválido');
    }
    const pessoa = this.#repositorio.buscar(digitos);
    if (!pessoa) {
      throw new ErroNaoEncontrado('Pessoa não encontrada');
    }
    return pessoa;
  }

  #apresentar(pessoa) {
    return { ...pessoa, idade: calcularIdade(pessoa.dataNascimento, this.#agora()) };
  }
}
