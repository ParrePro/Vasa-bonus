# Dockerfile for Express backend

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY server/package.json server/package.json

# Install dependencies
RUN cd server && npm install

# Copy server source code
COPY server/src server/src
COPY server/tsconfig.json server/tsconfig.json
COPY server/migrations server/migrations

# Build TypeScript
RUN cd server && npm run build

# Expose port
EXPOSE 3001

# Set working directory and start
WORKDIR /app/server
CMD ["npm", "start"]
