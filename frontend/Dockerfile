FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
run npm install
COPY . .


EXPOSE 5000

CMD ["node", "server.js"]