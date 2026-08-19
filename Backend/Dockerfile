# ==========================================
# Multi-stage Dockerfile for Backend (Node.js + Prisma + TypeScript)
# ==========================================

# 1. Base stage
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# 2. Dependencies stage
FROM base AS dependencies
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# 3. Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# 4. Production runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN apk add --no-cache openssl

# Security: Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressuser

COPY package*.json ./
COPY prisma ./prisma/
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R expressuser:nodejs /app

USER expressuser

EXPOSE 5015

ENV PORT=5015

CMD ["node", "dist/server.js"]
