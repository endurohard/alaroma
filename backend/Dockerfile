# Multi-stage Dockerfile for Node.js Backend

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

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

USER node

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Build the application (adjust command if using TypeScript or build step)
RUN npm run build || echo "No build script found, skipping..."

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy production dependencies
COPY --from=deps /tmp/prod_node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
