# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Install Python + pip (needed for yt-dlp) and ffmpeg
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Install yt-dlp system-wide
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Install root dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Install & build server
COPY server/package.json server/package-lock.json ./server/
RUN npm ci --prefix server
COPY server/ ./server/
RUN npm run build --prefix server

# Install & build client
COPY client/package.json client/package-lock.json ./client/
RUN npm ci --prefix client
COPY client/ ./client/
RUN npm run build --prefix client

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

# Install runtime dependencies: Python, ffmpeg, yt-dlp
RUN apt-get update && apt-get install -y \
    python3 \
    ffmpeg \
    curl \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Copy only production artifacts
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/client/dist ./client/dist
COPY package.json ./

# Create downloads directory
RUN mkdir -p server/downloads

# Environment
ENV NODE_ENV=production
ENV PORT=8080
ENV CLIENT_DIST_PATH=/app/client/dist

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

CMD ["node", "server/dist/server.js"]
