FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-bookworm-slim

ENV NODE_ENV=production \
    PORT=10000 \
    PGHOST=127.0.0.1 \
    PGPORT=5432 \
    PGDATABASE=mensajes \
    PGUSER=mensajes_app \
    PGPASSWORD=messages-container-internal

RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd /app/backend && npm ci --omit=dev
COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
COPY docker/entrypoint.sh /usr/local/bin/mensajes-entrypoint
RUN chmod +x /usr/local/bin/mensajes-entrypoint

EXPOSE 10000
ENTRYPOINT ["/usr/local/bin/mensajes-entrypoint"]