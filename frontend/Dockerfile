# Multi-stage Dockerfile for Next.js/React Frontend

# Base stage
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat curl

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && \
    cp -R node_modules /tmp/prod_node_modules && \
    npm ci

# Development stage
FROM base AS development
ENV NODE_ENV=development

COPY package*.json ./
RUN npm install

COPY . .

# Create .next directory with proper permissions
RUN mkdir -p /app/.next && chown -R node:node /app

USER node

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
ENV NODE_ENV=production

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Build the application
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy production dependencies
COPY --from=deps /tmp/prod_node_modules ./node_modules

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.* ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
