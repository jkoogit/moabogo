# -------------------------------------------------------------
# Stage 1: Build Frontend (Vite)
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production Server Runner
# -------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install tsx globally for TypeScript server execution
RUN npm install -g tsx

COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled static assets and server source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000

USER node

CMD ["tsx", "server.ts"]
