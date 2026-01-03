FROM node:20-slim
WORKDIR /app

# Install build dependencies for native modules (raknet-native)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    gcc \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
ENV PORT=5000
CMD ["npm", "start"]
