import { ErroValidacao } from '../erros.js';

const FORMATO_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const IDADE_MAXIMA = 150;

/** Quebra "AAAA-MM-DD" em números, devolvendo null se o formato não for esse. */
function decompor(texto) {
  const partes = typeof texto === 'string' ? FORMATO_ISO.exec(texto) : null;
  if (!partes) {
    return null;
  }
  const [ano, mes, dia] = partes.slice(1).map(Number);
  return { ano, mes, dia };
}

/** Confere se a data realmente existe no calendário (ex.: rejeita 30/02 e 29/02 em ano comum). */
function existeNoCalendario({ ano, mes, dia }) {
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );
}

function ehBissexto(ano) {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

/** Retorna [mes, dia] em que a pessoa "completa" anos no ano informado. */
function aniversarioNoAno({ mes, dia }, ano) {
  const nasceuEmBissexto = mes === 2 && dia === 29;
  if (nasceuEmBissexto && !ehBissexto(ano)) {
    return [3, 1];
  }
  return [mes, dia];
}

function anosCompletos(nascimento, referencia) {
  const anoRef = referencia.getFullYear();
  const [mesAniv, diaAniv] = aniversarioNoAno(nascimento, anoRef);
  const mesRef = referencia.getMonth() + 1;
  const diaRef = referencia.getDate();
  const jaFezAniversario = mesRef > mesAniv || (mesRef === mesAniv && diaRef >= diaAniv);

  return anoRef - nascimento.ano - (jaFezAniversario ? 0 : 1);
}

/**
 * Valida a data de nascimento ("AAAA-MM-DD") e devolve o próprio texto.
 * Lança ErroValidacao se o formato, a existência da data ou o intervalo forem inválidos.
 */
export function validarDataNascimento(texto, referencia = new Date()) {
  const nascimento = decompor(texto);

  if (!nascimento || !existeNoCalendario(nascimento)) {
    throw new ErroValidacao('Data de nascimento inválida (use AAAA-MM-DD)');
  }

  const inicioDoDia = new Date(nascimento.ano, nascimento.mes - 1, nascimento.dia);
  const hoje = new Date(
    referencia.getFullYear(),
    referencia.getMonth(),
    referencia.getDate(),
  );

  if (inicioDoDia > hoje) {
    throw new ErroValidacao('Data de nascimento não pode ser futura');
  }

  if (anosCompletos(nascimento, referencia) > IDADE_MAXIMA) {
    throw new ErroValidacao('Data de nascimento inválida (idade acima do limite)');
  }

  return texto;
}

/** Calcula a idade em anos completos na data de referência (padrão: hoje). */
export function calcularIdade(dataNascimento, referencia = new Date()) {
  validarDataNascimento(dataNascimento, referencia);
  return anosCompletos(decompor(dataNascimento), referencia);
}
