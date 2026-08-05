# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=24.17.0

FROM node:${NODE_VERSION}-alpine AS dependencies
WORKDIR /app
RUN apk add --no-cache openssl
COPY backend/package*.json backend/.npmrc ./backend/
COPY database/prisma ./database/prisma
RUN --mount=type=cache,target=/root/.npm \
    cd backend \
    && if [ -f package-lock.json ]; then \
         npm ci --ignore-scripts --no-audit --no-fund; \
       else \
         npm install --prefer-offline --ignore-scripts --no-audit --no-fund; \
       fi \
    && npm run prisma:generate

FROM dependencies AS build
COPY backend/tsconfig.json ./backend/tsconfig.json
COPY backend/src ./backend/src
RUN cd backend && npm run build

FROM dependencies AS production-dependencies
RUN cd backend && npm prune --omit=dev --ignore-scripts --no-audit --no-fund

FROM node:${NODE_VERSION}-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache openssl wget dumb-init \
    && addgroup -S routewell \
    && adduser -S routewell -G routewell
COPY --from=production-dependencies /app/backend/node_modules ./backend/node_modules
COPY --from=dependencies /app/database/prisma ./database/prisma
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/package.json ./backend/package.json
COPY backend/docker-entrypoint.sh ./backend/docker-entrypoint.sh
RUN chmod +x ./backend/docker-entrypoint.sh \
    && chown -R routewell:routewell /app
USER routewell
EXPOSE 8080
ENTRYPOINT ["/usr/bin/dumb-init", "--", "/app/backend/docker-entrypoint.sh"]
