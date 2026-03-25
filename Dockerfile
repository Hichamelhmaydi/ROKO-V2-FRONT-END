# Multi-stage build for Angular frontend
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Angular application
RUN npm run build

# Stage 2: Runtime - Serve static files with Node
FROM node:20-alpine

WORKDIR /app

# Lightweight static server for production assets
RUN npm install -g http-server

# Copy built Angular app from builder stage
COPY --from=builder /app/dist/roko-front/browser /app/browser

# Expose port
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4200 || exit 1

# Start static server
CMD ["http-server", "/app/browser", "-p", "4200", "-a", "0.0.0.0"]
