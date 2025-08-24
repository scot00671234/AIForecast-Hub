# Multi-stage build for minimal final image
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci --no-audit --no-fund && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN NODE_ENV=production npm run build

# Production stage - minimal image
FROM node:18-alpine as production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force && \
    rm -rf /usr/local/lib/node_modules/npm

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]