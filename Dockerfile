# Multi-Stage Production Dockerfile for AARIZO CommunityOS
# React (Vite) + Node.js (Express + Prisma) + PostgreSQL

FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate
RUN npm run build

# Final Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

COPY server/package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and generated artifacts
COPY --from=backend-builder /app/server/prisma ./prisma
COPY --from=backend-builder /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/server/node_modules/@prisma ./node_modules/@prisma

# Copy compiled backend code
COPY --from=backend-builder /app/server/dist ./dist

# Copy compiled frontend static assets to dist
COPY --from=frontend-builder /app/dist ./dist-client

EXPOSE 5000

CMD ["node", "dist/index.js"]
