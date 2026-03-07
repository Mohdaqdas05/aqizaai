FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose the port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the server
CMD ["node", "server.js"]
