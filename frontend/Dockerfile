# Frontend Dockerfile
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy application code
COPY . .

# Rebuild native modules for the current platform
RUN npm rebuild

# Build the application (without turbopack to avoid build issues)
RUN npx next build

# Clean up dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
