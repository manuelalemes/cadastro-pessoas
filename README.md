# Cadastro de Pessoas

CRUD de pessoas com **CPF**, **nome** e **data de nascimento**, calculando a **idade** automaticamente.
Desenvolvido em JavaScript (Node.js) com **TDD**, versionamento Git, análise estática, formatação,
testes unitários e de integração, CI no GitHub Actions e imagem Docker.

O projeto **não tem dependências de runtime**: a API usa apenas módulos nativos do Node
(`node:http`, `node:test`, `node:assert`). `eslint` e `prettier` são só ferramentas de desenvolvimento.

## Funcionalidades

- Cadastro, listagem, consulta, edição e exclusão de pessoas.
- CPF validado pelos **dígitos verificadores** (aceita com ou sem máscara; guarda só os dígitos).
- Idade em anos completos, incluindo quem nasceu em **29/02** (completa anos em 01/03 nos anos comuns).
- Data de nascimento validada: formato `AAAA-MM-DD`, data real, não futura, idade máxima de 150 anos.
- Respostas de erro padronizadas: `400` (validação), `404` (não encontrado), `409` (CPF duplicado),
  `405`, `413` e `500`.
- Interface web responsiva (máscara de CPF, busca, edição e exclusão com confirmação).

> Os dados ficam **em memória**: são perdidos ao reiniciar o servidor.

## Como executar

Requisitos: Node.js 20 ou superior (testado com o 22).

```bash
npm install        # instala eslint e prettier (desenvolvimento)
npm start          # http://localhost:3000
```

Variável opcional: `PORT` (padrão `3000`).

## Scripts

| Comando                    | O que faz                                    |
| -------------------------- | -------------------------------------------- |
| `npm test`                 | todos os testes                              |
| `npm run test:unit`        | testes unitários (domínio, serviço, máscara) |
| `npm run test:integration` | testes de integração (API HTTP real)         |
| `npm run test:coverage`    | testes com relatório de cobertura            |
| `npm run lint`             | análise estática (ESLint)                    |
| `npm run format:check`     | verifica a formatação (Prettier)             |
| `npm run format`           | corrige a formatação                         |

## API

| Método   | Rota            | Descrição                                  | Sucesso |
| -------- | --------------- | ------------------------------------------ | ------- |
| `GET`    | `/saude`        | verificação de saúde                       | 200     |
| `POST`   | `/pessoas`      | cadastra (`cpf`, `nome`, `dataNascimento`) | 201     |
| `GET`    | `/pessoas`      | lista (ordem alfabética)                   | 200     |
| `GET`    | `/pessoas/:cpf` | consulta por CPF                           | 200     |
| `PUT`    | `/pessoas/:cpf` | altera `nome` e/ou `dataNascimento`        | 200     |
| `DELETE` | `/pessoas/:cpf` | exclui                                     | 204     |

Exemplo:

```bash
curl -X POST http://localhost:3000/pessoas -H 'Content-Type: application/json' \
  -d '{"cpf":"529.982.247-25","nome":"Ana Souza","dataNascimento":"2000-05-10"}'
# {"cpf":"52998224725","nome":"Ana Souza","dataNascimento":"2000-05-10","idade":26}
```

## Estrutura

```
src/
  dominio/      cpf.js, idade.js            regras puras (sem I/O)
  servico/      servicoPessoas.js           regras do CRUD
  repositorio/  repositorioMemoria.js       armazenamento
  http/         aplicacao.js e apoio        rotas, corpo JSON, arquivos estáticos
  erros.js                                  ErroValidacao / NaoEncontrado / Conflito
  servidor.js                               ponto de entrada
public/         index.html, estilo.css, app.js, mascara.js
tests/          unit/, integration/, helpers/
```

## Docker

```bash
docker build -t cadastro-pessoas:1.0 .
docker run -d -p 3000:3000 --name cadastro cadastro-pessoas:1.0
curl http://localhost:3000/saude
```

## Fluxo de trabalho (TDD e Git)

Cada módulo foi desenvolvido em ciclos **RED → GREEN** (commits `test(...): [RED]` seguidos de
`feat(...): [GREEN]`) na branch `feature/crud-pessoas`, integrada à `main` por Pull Request
(ver `docs/PULL_REQUEST.md`). O CI (`.github/workflows/ci.yml`) executa lint, formatação, testes,
cobertura e build da imagem a cada push/PR.
