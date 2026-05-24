# =============================================================================
# NEBULA Multiverse Studio — Backend Dockerfile
# Architect: KNOCKS
# Stage 1: Install & prune dependencies
# Stage 2: Production-only runtime (Node + Express)
# =============================================================================

FROM node:20-alpine AS deps

LABEL maintainer="KNOCKS <architect@nebula-multiverse.studio>"
LABEL project="nebula-multiverse-studio"
LABEL component="backend"

WORKDIR /app
COPY services/backend/package*.json ./
RUN npm ci --prefer-offline

FROM deps AS builder
COPY services/backend/ .
# Uncomment if using TypeScript: RUN npm run build
RUN npm prune --production

FROM node:20-alpine AS production

LABEL maintainer="KNOCKS <architect@nebula-multiverse.studio>"
LABEL project="nebula-multiverse-studio"
LABEL component="backend"

RUN addgroup -S nebula && adduser -S nebula -G nebula
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/ .
RUN chown -R nebula:nebula /app

USER nebula

ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info \
    RENDER_ORCHESTRATOR_URL=http://nebula-render-orchestrator-svc:4000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/healthz || exit 1

CMD ["node", "src/index.js"]

