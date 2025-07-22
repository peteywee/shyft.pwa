# =================================================================
# 1. Base Stage: Install all dependencies
# This stage is cached to speed up future builds.
# =================================================================
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only the files needed to install dependencies
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies needed for the build)
RUN pnpm install

# =================================================================
# 2. Build Stage: Build the Next.js application
# This stage creates the optimized production build.
# =================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all source code
COPY . .
# Copy over the installed node_modules from the base stage
COPY --from=base /app/node_modules ./node_modules

# Build the Next.js application
RUN npm install -g pnpm
RUN pnpm run build

# =================================================================
# 3. Production Stage: Create the final, small, and secure image
# This stage creates the final image with only production files.
# =================================================================
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user and group for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone Next.js server output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy the static assets folder
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy the public assets folder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set the non-root user to run the application
USER nextjs

EXPOSE 3000

# Start the Node.js server that runs the Next.js app
CMD ["node", "server.js"]
