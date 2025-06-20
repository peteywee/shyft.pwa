# Stage 1: Base image with Node.js
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
# Using --frozen-lockfile is recommended for reproducible builds if package-lock.json exists
# For alpine, some packages might need build tools, consider `apk add --no-cache python3 make g++` if issues arise
RUN npm install

# Copy the rest of the application code
# This copy will be largely overridden by volume mounts in docker-compose for development,
# but it's useful for building standalone images or for caching layers.
COPY . .

# Expose the port Next.js runs on (default for `next dev` is 3000)
EXPOSE 3000

# Default command to run the development server.
# This will be overridden by docker-compose.yml for development scenarios.
# For production, this would typically be `npm run start` after an `npm run build`.
CMD ["npm", "run", "dev"]
