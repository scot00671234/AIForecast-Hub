# Alternative deployment - Pure Node.js container to bypass nixpacks
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . .

# Build the application with our cleanup
RUN npm run build && node fix-build.js

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV NO_CADDY=true
ENV DISABLE_CADDY=true

# Start the application
CMD ["node", "dist/index.js"]