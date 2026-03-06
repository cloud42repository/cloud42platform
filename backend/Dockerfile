# ─── Stage 1: Build ───────────────────────────────────────────────────────────
# Build context must be the repo ROOT (not the backend folder) so we can
# copy the shared apiConnector package alongside the backend source.
# docker build -f backend/Dockerfile -t cloud42-backend .

FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared apiConnector source (path-alias target)
COPY apiConnector/ ./apiConnector/

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

# Copy backend source
COPY backend/ ./backend/

# Compile TypeScript → dist/
WORKDIR /app/backend
RUN npm run build

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install only production deps + tsconfig-paths (needed at runtime for path aliases)
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm install tsconfig-paths

# Copy compiled output
COPY --from=builder /app/backend/dist ./dist

# Copy tsconfig so tsconfig-paths can resolve aliases at runtime
COPY backend/tsconfig.json ./tsconfig.json

# Copy shared apiConnector source (required by tsconfig paths at runtime)
COPY --from=builder /app/apiConnector ./apiConnector

EXPOSE 3000

ENV NODE_ENV=production

# Use tsconfig-paths/register so path aliases (@clients/*, @dto/*, etc.) resolve
CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
