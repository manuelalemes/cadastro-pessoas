import { criarAplicacao } from './http/aplicacao.js';
import { ServicoPessoas } from './servico/servicoPessoas.js';
import { RepositorioMemoria } from './repositorio/repositorioMemoria.js';

const porta = Number(process.env.PORT) || 3000;
const servico = new ServicoPessoas({ repositorio: new RepositorioMemoria() });
const servidor = criarAplicacao({ servico });

servidor.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});

for (const sinal of ['SIGINT', 'SIGTERM']) {
  process.on(sinal, () => servidor.close(() => process.exit(0)));
}
