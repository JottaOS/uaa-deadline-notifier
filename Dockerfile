FROM node:20-alpine

WORKDIR /app

# docker cachea las dependencias si el package.json no cambia
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["node", "dist/server.js"]