# Production environment
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy dependencies
#COPY --chown=node:node package*.json ./

COPY . .

# Install dependencies
RUN npm install

# Build app
RUN npm run build

# Remove source code
RUN rm -rf src

# Remove dev dependencies
RUN npm prune --omit=dev
# Expose port for container
EXPOSE 3000
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD curl -H 'Origin: http://127.0.0.1/' -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)' -f http://localhost:3000/health || exit 1

# Start server when container starts
CMD ["npm", "start"]
