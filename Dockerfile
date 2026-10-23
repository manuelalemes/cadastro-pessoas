# Imagem da aplicação: sem dependências de runtime, então não há "npm install" aqui.
ARG IMAGEM_BASE=node:22-alpine
FROM ${IMAGEM_BASE}

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

COPY package.json ./
COPY src ./src
COPY public ./public

# Executa como usuário sem privilégios (já existe na imagem oficial do Node)
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:3000/saude || exit 1

CMD ["node", "src/servidor.js"]
