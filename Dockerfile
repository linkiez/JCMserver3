# Base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code to container
COPY . .

# Build TypeScript files
RUN npm run build

# Expose port for container
EXPOSE 3000

# Start server when container starts
CMD ["npm", "start"]
