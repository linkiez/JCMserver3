# Production environment
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy dependencies
#COPY --chown=node:node package*.json ./

COPY . .

# Install dependencies
RUN npm install --verbose

# Build app
RUN npm run build

# Remove source code
RUN rm -rf src

# Remove dev dependencies
RUN npm prune --production

# Expose port for container
EXPOSE 3000
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s CMD curl -f http://localhost:3000/health || exit 1

# Start server when container starts
CMD ["npm", "start"]
