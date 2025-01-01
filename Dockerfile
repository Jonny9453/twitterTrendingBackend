bashCopy code
FROM node:22.12.0
WORKDIR /app
COPY package*.json ./
RUN npm install
copy . .
EXPOSE 4000
CMD ["node", "server.js"]