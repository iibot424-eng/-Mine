FROM node:20-slim
WORKDIR /app

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    gcc \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
# Установка зависимостей без лишних флагов
RUN npm install
COPY . .
RUN npm run build

# Render автоматически прокидывает PORT, мы просто слушаем его
EXPOSE 5000
ENV NODE_ENV=production
CMD ["npm", "start"]
