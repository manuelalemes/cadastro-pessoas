# feat: CRUD de pessoas (CPF, nome, data de nascimento e idade) com TDD

**Branch:** `feature/crud-pessoas` → `main`

## Resumo

Implementa o CRUD de pessoas com cálculo de idade, seguindo TDD, com API HTTP, interface web,
análise estática, formatação, pipeline de CI e imagem Docker.

## O que mudou

- **Domínio:** validação de CPF por dígitos verificadores; cálculo de idade (29/02, datas inválidas e futuras).
- **Serviço:** regras do CRUD com `ErroValidacao` (400), `ErroNaoEncontrado` (404) e `ErroConflito` (409).
- **Repositório:** armazenamento em memória indexado pelo CPF (cópias defensivas).
- **API:** rotas REST em `/pessoas`, `/saude`, tratamento central de erros, limite de corpo (413) e proteção contra path traversal nos arquivos estáticos.
- **Frontend:** formulário com máscara de CPF, listagem com idade, busca, edição e exclusão.
- **Qualidade:** ESLint (análise estática) e Prettier (formatação).
- **CI:** GitHub Actions (lint, formatação, testes unitários e de integração, cobertura, build da imagem).
- **Docker:** `Dockerfile` (Node 22 Alpine, usuário não-root, healthcheck).

## Como foi testado

- 121 testes (unitários e de integração) passando; cobertura de linhas ≈ 97 %.
- `eslint .` e `prettier --check .` sem pendências.
- Fluxo completo exercitado no navegador (cadastrar, erro de CPF, duplicidade, editar, buscar, excluir).
- Imagem construída e contêiner respondendo em `/saude` com status `healthy`.

## Checklist

- [x] Testes escritos antes da implementação (commits `[RED]` → `[GREEN]`)
- [x] Testes unitários passando
- [x] Testes de integração passando
- [x] Análise estática sem erros
- [x] Código formatado
- [x] Pipeline de CI configurado
- [x] Imagem Docker criada
- [x] README atualizado
