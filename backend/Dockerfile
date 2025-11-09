# Use Node.js LTS version
FROM node:20-slim

# Install dependencies for node-gyp and PostgreSQL client
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose API port
EXPOSE 3000

# Start command
CMD [ "npm", "start" ]
