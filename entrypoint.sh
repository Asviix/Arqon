#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Set working directory explicitly for safety
cd /usr/src/app

# Wait for the database (5 seconds is a minimum; use a proper 'wait-for-it' script in production)
echo "Waiting for database (5 seconds)..."
sleep 5

# Run the Prisma schema push, now using the --config flag.
# Prisma will load the DATABASE_URL from the runtime environment using the config file.
echo "Running Prisma migrations/schema push..."
npx prisma db push

echo "Starting Discord Bot..."
# Execute the main application command (from the CMD instruction)
exec "$@"