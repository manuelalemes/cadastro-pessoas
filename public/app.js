import { dataParaBr, mascararCpf, textoIdade } from './mascara.js';

const form = document.querySelector('#form-pessoa');
const campoCpf = document.querySelector('#cpf');
const campoNome = document.querySelector('#nome');
const campoData = document.querySelector('#dataNascimento');
const campoBusca = document.querySelector('#busca');
const corpoTabela = document.querySelector('#corpo-tabela');
const aviso = document.querySelector('#aviso');
const vazio = document.querySelector('#vazio');
const contador = document.querySelector('#contador');
const tituloForm = document.querySelector('#titulo-form');
const btnSalvar = document.querySelector('#btn-salvar');
const btnCancelar = document.querySelector('#btn-cancelar');

let pessoas = [];
let cpfEmEdicao = null;
let temporizadorAviso;

/* ---------- comunicação com a API ---------- */

async function chamarApi(url, opcoes) {
  const resposta = await fetch(url, opcoes);
  const dados = resposta.status === 204 ? null : await resposta.json();
  if (!resposta.ok) {
    throw new Error(dados?.erro ?? 'Falha na comunicação com o servidor');
  }
  return dados;
}

const enviarJson = (metodo, corpo) => ({
  method: metodo,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(corpo),
});

/* ---------- mensagens ---------- */

function mostrarAviso(texto, tipo) {
  clearTimeout(temporizadorAviso);
  aviso.textContent = texto;
  aviso.className = `aviso ${tipo}`;
  aviso.hidden = false;
  if (tipo === 'sucesso') {
    temporizadorAviso = setTimeout(() => {
      aviso.hidden = true;
    }, 4000);
  }
}

/* ---------- lista ---------- */

function criarBotao(texto, classe, aoClicar) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.textContent = texto;
  botao.className = `${classe} pequeno`;
  botao.addEventListener('click', aoClicar);
  return botao;
}

function criarLinha(pessoa) {
  const linha = document.createElement('tr');
  const valores = [
    pessoa.nome,
    mascararCpf(pessoa.cpf),
    dataParaBr(pessoa.dataNascimento),
    textoIdade(pessoa.idade),
  ];
  for (const valor of valores) {
    const celula = document.createElement('td');
    celula.textContent = valor;
    linha.append(celula);
  }

  const acoes = document.createElement('td');
  acoes.className = 'acoes';
  acoes.append(
    criarBotao('Editar', 'neutro', () => iniciarEdicao(pessoa)),
    criarBotao('Excluir', 'perigo', () => excluir(pessoa)),
  );
  linha.append(acoes);
  return linha;
}

function desenharLista() {
  const termo = campoBusca.value.trim().toLowerCase();
  const termoDigitos = termo.replace(/\D/g, '');
  const filtradas = pessoas.filter(
    (p) =>
      p.nome.toLowerCase().includes(termo) ||
      (termoDigitos && p.cpf.includes(termoDigitos)),
  );

  corpoTabela.replaceChildren(...filtradas.map(criarLinha));
  vazio.hidden = filtradas.length > 0;
  contador.textContent = String(pessoas.length);
}

async function carregar() {
  try {
    pessoas = await chamarApi('/pessoas');
    desenharLista();
  } catch (erro) {
    mostrarAviso(erro.message, 'erro');
  }
}

/* ---------- formulário ---------- */

function limparErrosDeCampo() {
  for (const campo of [campoCpf, campoNome, campoData]) {
    campo.removeAttribute('aria-invalid');
  }
}

function validarCamposVazios() {
  limparErrosDeCampo();
  const vazios = [campoCpf, campoNome, campoData].filter((campo) => !campo.value.trim());
  for (const campo of vazios) {
    campo.setAttribute('aria-invalid', 'true');
  }
  if (vazios.length > 0) {
    vazios[0].focus();
    mostrarAviso('Preencha todos os campos.', 'erro');
  }
  return vazios.length === 0;
}

function sairDoModoEdicao() {
  cpfEmEdicao = null;
  form.reset();
  campoCpf.disabled = false;
  tituloForm.textContent = 'Nova pessoa';
  btnSalvar.textContent = 'Cadastrar';
  btnCancelar.hidden = true;
  limparErrosDeCampo();
}

function iniciarEdicao(pessoa) {
  cpfEmEdicao = pessoa.cpf;
  campoCpf.value = mascararCpf(pessoa.cpf);
  campoCpf.disabled = true; // o CPF identifica o registro e não pode ser trocado
  campoNome.value = pessoa.nome;
  campoData.value = pessoa.dataNascimento;
  tituloForm.textContent = 'Editar pessoa';
  btnSalvar.textContent = 'Salvar alterações';
  btnCancelar.hidden = false;
  aviso.hidden = true;
  campoNome.focus();
}

async function salvar(evento) {
  evento.preventDefault();
  if (!validarCamposVazios()) {
    return;
  }

  const dados = { nome: campoNome.value, dataNascimento: campoData.value };
  try {
    if (cpfEmEdicao) {
      await chamarApi(`/pessoas/${cpfEmEdicao}`, enviarJson('PUT', dados));
      mostrarAviso('Cadastro atualizado com sucesso.', 'sucesso');
    } else {
      await chamarApi('/pessoas', enviarJson('POST', { ...dados, cpf: campoCpf.value }));
      mostrarAviso('Pessoa cadastrada com sucesso.', 'sucesso');
    }
    sairDoModoEdicao();
    await carregar();
  } catch (erro) {
    mostrarAviso(erro.message, 'erro');
  }
}

async function excluir(pessoa) {
  if (!confirm(`Excluir o cadastro de ${pessoa.nome}?`)) {
    return;
  }
  try {
    await chamarApi(`/pessoas/${pessoa.cpf}`, { method: 'DELETE' });
    if (cpfEmEdicao === pessoa.cpf) {
      sairDoModoEdicao();
    }
    mostrarAviso('Cadastro excluído.', 'sucesso');
    await carregar();
  } catch (erro) {
    mostrarAviso(erro.message, 'erro');
  }
}

/* ---------- eventos ---------- */

campoCpf.addEventListener('input', () => {
  campoCpf.value = mascararCpf(campoCpf.value);
});
campoBusca.addEventListener('input', desenharLista);
form.addEventListener('submit', salvar);
btnCancelar.addEventListener('click', () => {
  sairDoModoEdicao();
  aviso.hidden = true;
});

carregar();
