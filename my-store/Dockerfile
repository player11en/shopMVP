# Medusa Backend Dockerfile
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 9000

# Start in development mode (no build needed)
CMD ["npm", "run", "dev"]

