FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies first for caching layers
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY . .

EXPOSE 5004

CMD ["node", "server.js"]
