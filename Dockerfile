FROM node:20.11-alpine

# Instalando o Chromium
RUN apk add --no-cache chromium

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

COPY * ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8083

CMD [ "node", "az-reporter.mjs" ]