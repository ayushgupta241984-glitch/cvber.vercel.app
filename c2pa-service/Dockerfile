# Use Node.js 20 base image
FROM node:20-slim

# Install system dependencies for C2PA node module
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and config
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (default for C2PA service)
EXPOSE 3001

# Start the service
CMD ["npm", "start"]
