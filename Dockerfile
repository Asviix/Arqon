# Dockerfile

# Stage 1: Build Stage
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY --chown=node:node package.json package-lock.json ./
RUN npm install
COPY --chown=node:node . .

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Production/Runtime Stage
FROM node:20-slim

WORKDIR /usr/src/app

# Copy only necessary runtime files from the build stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY src ./src
COPY package.json .

# Define the command to run your compiled code
CMD ["node", "dist/index.js", "--env=production"]