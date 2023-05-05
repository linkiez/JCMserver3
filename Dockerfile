# Production environment
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy dependencies
COPY --chown=node:node package*.json ./

RUN npm install --omit=dev

COPY . .

# Expose port for container
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s CMD curl -f http://localhost:2486/health || exit 1

# Start server when container starts
CMD ["npm", "start"]
