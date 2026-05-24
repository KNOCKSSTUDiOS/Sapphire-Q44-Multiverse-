# =============================================================================
# NEBULA Multiverse Studio — Frontend Dockerfile
# Architect: KNOCKS
# Stage 1: Build (Vite + React)
# Stage 2: Serve via Nginx (production-grade, minimal image)
# =============================================================================

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

LABEL maintainer="KNOCKS <architect@nebula-multiverse.studio>"
LABEL project="nebula-multiverse-studio"
LABEL component="frontend"

WORKDIR /app

# Copy dependency manifests first (layer cache optimisation)
# Supports both universes/PrimeVerse/frontend and frontend_stub layouts
COPY universes/PrimeVerse/frontend/package*.json ./

RUN npm ci --prefer-offline

COPY universes/PrimeVerse/frontend/ .

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: Production Nginx ──────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

LABEL maintainer="KNOCKS <architect@nebula-multiverse.studio>"
LABEL project="nebula-multiverse-studio"
LABEL component="frontend"

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html
COPY deploy/frontend/nginx.conf /etc/nginx/conf.d/default.conf

RUN addgroup -S nebula && adduser -S nebula -G nebula \
    && chown -R nebula:nebula /usr/share/nginx/html \
    && chown -R nebula:nebula /var/cache/nginx \
    && touch /var/run/nginx.pid \
    && chown nebula:nebula /var/run/nginx.pid

USER nebula
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
