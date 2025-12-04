# Dockerfile

# Stage 1: Build Stage
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY --chown=node:node package.json package-lock.json ./
RUN npm install
COPY --chown=node:node . .

# Generate the Prisma Client
RUN npx prisma generate --config=./prisma.config.ts

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Production/Runtime Stage
FROM node:20-slim

# Install FFMpeg
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg chromium && \
    # 5. Clean up
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy only necessary runtime files from the build stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY src ./src
COPY package.json .
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.ts ./prisma.config.ts

# --- Entrypoint Setup ---
# Copy the entrypoint script and make it executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Install chrome for puppeteer
RUN npx puppeteer browsers install chrome

# Use the entrypoint script to run the setup and then the main application
ENTRYPOINT ["./entrypoint.sh"]

# Define the command to run your compiled code
CMD ["node", "dist/index.js", "--env=production"]