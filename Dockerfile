# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Install Python (with python-is-python3), ffmpeg, curl, and ca-certificates
RUN apt-get update && apt-get install -y \
    python3 \
    python-is-python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Install yt-dlp system-wide
RUN curl -k -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Copy source repository
COPY . .

# Install dependencies and build
RUN npm install --ignore-scripts
RUN npm install --prefix server --ignore-scripts
RUN npm run build --prefix server
RUN npm install --prefix client --ignore-scripts
RUN npm run build --prefix client

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

# Install runtime dependencies: Python, ffmpeg, curl, ca-certificates
RUN apt-get update && apt-get install -y \
    python3 \
    python-is-python3 \
    ffmpeg \
    curl \
    ca-certificates \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Install yt-dlp system-wide
RUN curl -k -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Copy build artifacts
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/client/dist ./client/dist
COPY package.json ./

# Create downloads directory
RUN mkdir -p server/downloads

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV CLIENT_DIST_PATH=/app/client/dist

EXPOSE 8080

CMD ["node", "server/dist/server.js"]
