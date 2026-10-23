const TAMANHO_CPF = 11;

/** Mantém somente os dígitos de um texto; qualquer outro tipo de valor vira "". */
export function apenasDigitos(valor) {
  return typeof valor === 'string' ? valor.replace(/\D/g, '') : '';
}

/**
 * Dígito verificador: soma ponderada (pesos decrescentes a partir de tamanho + 1),
 * multiplicada por 10 e reduzida módulo 11 (10 vira 0).
 */
function digitoVerificador(base) {
  const pesoInicial = base.length + 1;
  let soma = 0;
  for (let i = 0; i < base.length; i++) {
    soma += Number(base[i]) * (pesoInicial - i);
  }
  return ((soma * 10) % 11) % 10;
}

/** Valida CPF, com ou sem máscara, conferindo os dois dígitos verificadores. */
export function cpfValido(valor) {
  const cpf = apenasDigitos(valor);

  if (cpf.length !== TAMANHO_CPF || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  const [d1, d2] = [
    digitoVerificador(cpf.slice(0, 9)),
    digitoVerificador(cpf.slice(0, 10)),
  ];
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

/** Aplica a máscara 000.000.000-00; se não houver 11 dígitos, devolve o valor como veio. */
export function formatarCpf(valor) {
  const cpf = apenasDigitos(valor);
  if (cpf.length !== TAMANHO_CPF) {
    return typeof valor === 'string' ? valor : '';
  }
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}
