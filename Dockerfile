FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy source code and config
COPY src/ ./src/
COPY config/ ./config/
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Create non-root user
RUN useradd -m -u 1000 mcpuser && \
  chown -R mcpuser:mcpuser /app

# Create log directory
RUN mkdir -p /app/log && chown -R mcpuser:mcpuser /app/log

# Switch to non-root user
USER mcpuser

# Default command
CMD ["node", "build/index.js"]
