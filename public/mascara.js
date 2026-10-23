// Funções puras usadas pela interface. Ficam em um módulo separado para poderem ser
// testadas no Node sem precisar de navegador.

const MAX_DIGITOS_CPF = 11;

/** Aplica a máscara 000.000.000-00 enquanto a pessoa digita. */
export function mascararCpf(valor) {
  const d = String(valor ?? '')
    .replace(/\D/g, '')
    .slice(0, MAX_DIGITOS_CPF);

  const [a, b, c, e] = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9), d.slice(9)];
  let saida = a;
  if (b) {
    saida += `.${b}`;
  }
  if (c) {
    saida += `.${c}`;
  }
  if (e) {
    saida += `-${e}`;
  }
  return saida;
}

/** "2000-05-10" -> "10/05/2000". Formatos desconhecidos voltam como vieram. */
export function dataParaBr(dataIso) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataIso);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : dataIso;
}

export function textoIdade(idade) {
  return `${idade} ${idade === 1 ? 'ano' : 'anos'}`;
}
