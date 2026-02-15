ARG NODE_VERSION=22.11.0
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app

# Copy built artifacts and dependencies from local environment
COPY package*.json ./
COPY node_modules ./node_modules
COPY build ./build
COPY config ./config

# Use existing node user (UID 1000)
RUN chown -R node:node /app

# Create log and workspace directories
RUN mkdir -p /app/log /workspace && \
    chown -R node:node /app/log /workspace

# Switch to non-root user
USER node

# Default command
CMD ["node", "build/index.js"]
