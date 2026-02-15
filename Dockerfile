# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Use --ignore-scripts to prevent husky from running
RUN npm ci --ignore-scripts

# Copy source code and config
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
# Use --ignore-scripts to prevent husky from running
RUN npm ci --production --ignore-scripts

# Copy built artifacts and config from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/config ./config

# Use existing node user (UID 1000)
RUN chown -R node:node /app

# Create log directory
RUN mkdir -p /app/log && chown -R node:node /app/log

# Switch to non-root user
USER node

# Default command
CMD ["node", "build/index.js"]
