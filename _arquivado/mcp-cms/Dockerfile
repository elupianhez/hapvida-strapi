FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY server.mjs ./
EXPOSE 3100
CMD ["node", "server.mjs"]
